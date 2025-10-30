const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// ============================================
// CREAR EMPEÑO DESDE CITA (FLUJO COMPLETO)
// ============================================

router.post('/crear-desde-cita', authMiddleware, isAdmin, (req, res) => {
  const { id_cita, monto_prestado, interes, plazo_dias, notas } = req.body;

  // 1. Obtener datos de la cita
  db.get(`
    SELECT c.*, p.id_objeto, p.resultado_valor, u.id_usuario, u.nombre, o.tipo, o.marca, o.modelo
    FROM citas c
    JOIN precotizaciones p ON c.id_precotizacion = p.id_analisis
    JOIN usuarios u ON c.id_usuario = u.id_usuario
    JOIN objetos o ON p.id_objeto = o.id_objeto
    WHERE c.id_cita = ?
  `, [id_cita], (err, cita) => {
    if (err || !cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (cita.estado !== 'confirmada') {
      return res.status(400).json({ error: 'La cita debe estar confirmada primero' });
    }

    // 2. Calcular fechas
    const fechaInicio = new Date().toISOString().split('T')[0];
    const fechaVencimiento = new Date(Date.now() + (plazo_dias || 30) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    // 3. Crear el empeño
    db.run(`
      INSERT INTO empenos (id_usuario, id_objeto, monto_prestado, interes, fecha_inicio, fecha_vencimiento, estado, notas)
      VALUES (?, ?, ?, ?, ?, ?, 'activo', ?)
    `, [cita.id_usuario, cita.id_objeto, monto_prestado, interes, fechaInicio, fechaVencimiento, notas],
    function(err) {
      if (err) {
        console.error('Error al crear empeño:', err);
        return res.status(500).json({ error: 'Error al crear empeño' });
      }

      const idEmpeno = this.lastID;

      // 4. Cambiar estado de la cita a "completada"
      db.run('UPDATE citas SET estado = ? WHERE id_cita = ?', ['completada', id_cita], (err) => {
        if (err) console.error('Error al actualizar cita:', err);
      });

      // 5. Cambiar estado de la precotización
      db.run('UPDATE precotizaciones SET estado = ? WHERE id_analisis = ?', ['aprobada', cita.id_precotizacion], (err) => {
        if (err) console.error('Error al actualizar precotización:', err);
      });

      // 6. Generar código QR del empeño
      const codigoQR = `EMP-${idEmpeno}-${Date.now().toString(36).toUpperCase()}`;
      
      db.run('UPDATE empenos SET codigo_qr = ? WHERE id_empeno = ?', [codigoQR, idEmpeno]);

      res.json({
        success: true,
        message: 'Empeño creado exitosamente',
        id_empeno: idEmpeno,
        codigo_qr: codigoQR,
        fecha_vencimiento: fechaVencimiento,
        usuario: {
          nombre: cita.nombre,
          id: cita.id_usuario
        },
        objeto: {
          tipo: cita.tipo,
          marca: cita.marca,
          modelo: cita.modelo
        },
        monto: {
          prestado: monto_prestado,
          interes: interes,
          total_recuperar: monto_prestado + interes
        }
      });
    });
  });
});

// ============================================
// OBTENER CITA CON TODOS LOS DETALLES PARA CREAR EMPEÑO
// ============================================

router.get('/cita-detalle/:id', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT 
      c.*,
      u.id_usuario, u.nombre as usuario_nombre, u.dni, u.contacto, u.email,
      p.id_analisis, p.resultado_valor, p.confiabilidad,
      o.id_objeto, o.tipo, o.marca, o.modelo, o.descripcion, o.estado, o.antiguedad, o.fotos, o.video
    FROM citas c
    JOIN usuarios u ON c.id_usuario = u.id_usuario
    LEFT JOIN precotizaciones p ON c.id_precotizacion = p.id_analisis
    LEFT JOIN objetos o ON p.id_objeto = o.id_objeto
    WHERE c.id_cita = ?
  `;

  db.get(query, [req.params.id], (err, cita) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Calcular sugerencias automáticas
    const valorEstimado = cita.resultado_valor || 0;
    const porcentajePrestamo = 0.7; // 70% del valor
    const tasaInteres = 0.05; // 5% mensual
    
    const sugerencias = {
      monto_prestado: Math.round(valorEstimado * porcentajePrestamo),
      interes: Math.round(valorEstimado * porcentajePrestamo * tasaInteres),
      plazo_dias: 30,
      total_a_pagar: Math.round(valorEstimado * porcentajePrestamo * (1 + tasaInteres))
    };

    res.json({
      cita,
      sugerencias
    });
  });
});

// ============================================
// NOTIFICACIONES EN TIEMPO REAL
// ============================================

router.get('/notificaciones', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.rol === 'admin';

  // Consultar notificaciones de la tabla
  let query = `
    SELECT * FROM notificaciones 
    WHERE id_usuario = ? OR tipo IN ('cita_pendiente', 'empeno_vencido')
    ORDER BY fecha_creacion DESC 
    LIMIT 50
  `;
  
  let params = [userId];
  
  if (isAdmin) {
    // Para admin, mostrar todas las notificaciones del sistema
    query = `
      SELECT * FROM notificaciones 
      WHERE tipo IN ('cita_pendiente', 'empeno_vencido', 'pago_vencido')
      OR id_usuario = ?
      ORDER BY fecha_creacion DESC 
      LIMIT 50
    `;
  }

  db.all(query, params, (err, notificaciones) => {
    if (err) {
      console.error('Error obteniendo notificaciones:', err);
      return res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
    
    res.json(notificaciones || []);
  });
});

// ============================================
// PAGO DE EMPEÑO (SIMULACIÓN)
// ============================================

router.post('/pago/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { tipo_pago, metodo_pago } = req.body; // tipo: 'renovacion' | 'total'

  db.get('SELECT * FROM empenos WHERE id_empeno = ? AND id_usuario = ?', [id, req.user.id], (err, empeno) => {
    if (err || !empeno) {
      return res.status(404).json({ error: 'Empeño no encontrado' });
    }

    if (tipo_pago === 'renovacion') {
      // Renovar empeño
      const nuevaFechaVencimiento = new Date(new Date(empeno.fecha_vencimiento).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      db.run(
        'UPDATE empenos SET fecha_vencimiento = ?, renovaciones = renovaciones + 1 WHERE id_empeno = ?',
        [nuevaFechaVencimiento, id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error al renovar empeño' });
          }

          // Registrar pago
          db.run(`
            INSERT INTO pagos (id_empeno, tipo_pago, monto, metodo_pago, fecha_pago)
            VALUES (?, 'renovacion', ?, ?, datetime('now'))
          `, [id, empeno.interes, metodo_pago]);

          res.json({
            success: true,
            message: '✅ Renovación exitosa',
            nueva_fecha_vencimiento: nuevaFechaVencimiento,
            monto_pagado: empeno.interes,
            metodo_pago
          });
        }
      );
    } else {
      // Pago total
      const montoTotal = empeno.monto_prestado + empeno.interes;
      
      db.run('UPDATE empenos SET estado = ? WHERE id_empeno = ?', ['finalizado', id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al finalizar empeño' });
        }

        // Registrar pago
        db.run(`
          INSERT INTO pagos (id_empeno, tipo_pago, monto, metodo_pago, fecha_pago)
          VALUES (?, 'total', ?, ?, datetime('now'))
        `, [id, montoTotal, metodo_pago]);

        res.json({
          success: true,
          message: '🎉 Empeño finalizado. Puedes retirar tu objeto.',
          monto_pagado: montoTotal,
          metodo_pago,
          codigo_retiro: `RET-${id}-${Date.now().toString(36).toUpperCase()}`
        });
      });
    }
  });
});

// ============================================
// HISTORIAL DE PAGOS
// ============================================

router.get('/historial-pagos/:id_empeno', authMiddleware, (req, res) => {
  db.all(`
    SELECT * FROM pagos 
    WHERE id_empeno = ? 
    ORDER BY fecha_pago DESC
  `, [req.params.id_empeno], (err, pagos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener historial' });
    }
    res.json(pagos);
  });
});

// ============================================
// GENERAR CONTRATO PDF (SIMULACIÓN)
// ============================================

router.get('/contrato/:id', authMiddleware, isAdmin, (req, res) => {
  db.get(`
    SELECT e.*, o.tipo, o.marca, o.modelo, u.nombre, u.dni, u.contacto
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE e.id_empeno = ?
  `, [req.params.id], (err, empeno) => {
    if (err || !empeno) {
      return res.status(404).json({ error: 'Empeño no encontrado' });
    }

    // Aquí iría la generación del PDF
    // Por ahora devolvemos los datos del contrato
    res.json({
      success: true,
      contrato: {
        numero: `CONT-${empeno.id_empeno}`,
        fecha: empeno.fecha_inicio,
        cliente: {
          nombre: empeno.nombre,
          dni: empeno.dni,
          contacto: empeno.contacto
        },
        objeto: {
          tipo: empeno.tipo,
          marca: empeno.marca,
          modelo: empeno.modelo
        },
        condiciones: {
          monto_prestado: empeno.monto_prestado,
          interes: empeno.interes,
          fecha_vencimiento: empeno.fecha_vencimiento,
          plazo_dias: 30
        },
        codigo_qr: empeno.codigo_qr
      }
    });
  });
});

// ============================================
// ESTADÍSTICAS AVANZADAS PARA DASHBOARD
// ============================================

router.get('/estadisticas-avanzadas', authMiddleware, (req, res) => {
  const userId = req.user.id;

  const queries = {
    // Total ganado en intereses
    interesesGanados: `
      SELECT SUM(interes) as total 
      FROM empenos 
      WHERE id_usuario = ? AND estado IN ('finalizado', 'activo')
    `,
    // Promedio de préstamo
    promedioPrestamo: `
      SELECT AVG(monto_prestado) as promedio
      FROM empenos
      WHERE id_usuario = ?
    `,
    // Total renovaciones
    totalRenovaciones: `
      SELECT SUM(renovaciones) as total
      FROM empenos
      WHERE id_usuario = ?
    `,
    // Objetos más empeñados
    objetosPopulares: `
      SELECT o.tipo, COUNT(*) as cantidad
      FROM empenos e
      JOIN objetos o ON e.id_objeto = o.id_objeto
      WHERE e.id_usuario = ?
      GROUP BY o.tipo
      ORDER BY cantidad DESC
      LIMIT 3
    `
  };

  const stats = {};
  let completados = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'objetosPopulares') {
      db.all(query, [userId], (err, result) => {
        stats[key] = err ? [] : result;
        completados++;
        if (completados === totalQueries) {
          res.json(stats);
        }
      });
    } else {
      db.get(query, [userId], (err, result) => {
        stats[key] = err ? 0 : (result.total || result.promedio || 0);
        completados++;
        if (completados === totalQueries) {
          res.json(stats);
        }
      });
    }
  });
});

// ============================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ============================================

router.put('/notificaciones/:id/leer', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run(`
    UPDATE notificaciones 
    SET leida = 1 
    WHERE id_notificacion = ? AND id_usuario = ?
  `, [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al marcar notificación' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json({ success: true });
  });
});

module.exports = router;
