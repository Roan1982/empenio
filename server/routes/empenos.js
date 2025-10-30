const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Crear empeño (admin)
router.post('/crear', authMiddleware, isAdmin, (req, res) => {
  const { id_usuario, id_objeto, monto_prestado, interes, plazo_dias, notas } = req.body;

  // Validaciones
  if (!id_usuario || !id_objeto || !monto_prestado || !interes) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const fechaInicio = new Date().toISOString().split('T')[0];
  const dias = plazo_dias || 30;
  const fechaVencimiento = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  db.run(
    `INSERT INTO empenos (id_usuario, id_objeto, monto_prestado, interes, fecha_inicio, fecha_vencimiento, estado, notas)
     VALUES (?, ?, ?, ?, ?, ?, 'activo', ?)`,
    [id_usuario, id_objeto, monto_prestado, interes, fechaInicio, fechaVencimiento, notas || ''],
    function(err) {
      if (err) {
        console.error('Error al crear empeño:', err);
        return res.status(500).json({ error: 'Error al crear empeño: ' + err.message });
      }

      res.json({
        message: 'Empeño creado exitosamente',
        id_empeno: this.lastID,
        fecha_vencimiento: fechaVencimiento
      });
    }
  );
});

// Alias para compatibilidad
router.post('/', authMiddleware, isAdmin, (req, res) => {
  console.log('📝 POST /empenos recibido');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user);
  
  const { id_usuario, id_objeto, monto_prestado, interes, plazo_dias, notas } = req.body;

  // Validaciones
  if (!id_usuario || !id_objeto || !monto_prestado || !interes) {
    console.log('❌ Faltan datos requeridos');
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const fechaInicio = new Date().toISOString().split('T')[0];
  const dias = plazo_dias || 30;
  const fechaVencimiento = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log('💾 Insertando empeño con datos:', {
    id_usuario,
    id_objeto,
    monto_prestado,
    interes,
    fechaInicio,
    fechaVencimiento,
    notas: notas || ''
  });

  db.run(
    `INSERT INTO empenos (id_usuario, id_objeto, monto_prestado, interes, fecha_inicio, fecha_vencimiento, estado, notas)
     VALUES (?, ?, ?, ?, ?, ?, 'activo', ?)`,
    [id_usuario, id_objeto, monto_prestado, interes, fechaInicio, fechaVencimiento, notas || ''],
    function(err) {
      if (err) {
        console.error('❌ Error al crear empeño:', err);
        return res.status(500).json({ error: 'Error al crear empeño: ' + err.message });
      }

      console.log('✅ Empeño creado exitosamente, ID:', this.lastID);
      res.json({
        message: 'Empeño creado exitosamente',
        id_empeno: this.lastID,
        fecha_vencimiento: fechaVencimiento
      });
    }
  );
});

// Obtener mis empeños activos
router.get('/mis-empenos', authMiddleware, (req, res) => {
  const query = `
    SELECT e.*, o.tipo, o.marca, o.modelo, o.descripcion, o.fotos
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    WHERE e.id_usuario = ? AND e.estado = 'activo'
    ORDER BY e.fecha_vencimiento ASC
  `;

  db.all(query, [req.user.id], (err, empenos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    // Calcular días restantes
    empenos = empenos.map(e => {
      const hoy = new Date();
      const vencimiento = new Date(e.fecha_vencimiento);
      const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
      return { ...e, dias_restantes: diasRestantes };
    });

    res.json(empenos);
  });
});

// Renovar empeño
router.post('/:id/renovar', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM empenos WHERE id_empeno = ? AND id_usuario = ?', [id, req.user.id], (err, empeno) => {
    if (err || !empeno) {
      return res.status(404).json({ error: 'Empeño no encontrado' });
    }

    if (empeno.estado !== 'activo') {
      return res.status(400).json({ error: 'El empeño no está activo' });
    }

    const nuevaFechaVencimiento = new Date(new Date(empeno.fecha_vencimiento).getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    db.run(
      'UPDATE empenos SET fecha_vencimiento = ?, renovaciones = renovaciones + 1 WHERE id_empeno = ?',
      [nuevaFechaVencimiento, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al renovar empeño' });
        }

        // Registrar renovación
        db.run(
          `INSERT INTO renovaciones (id_empeno, monto_pagado, fecha_renovacion, nueva_fecha_vencimiento)
           VALUES (?, ?, date('now'), ?)`,
          [id, empeno.interes, nuevaFechaVencimiento],
          (err) => {
            if (err) console.error('Error al registrar renovación:', err);
          }
        );

        res.json({
          message: 'Empeño renovado exitosamente',
          nueva_fecha_vencimiento: nuevaFechaVencimiento,
          monto_pagado: empeno.interes
        });
      }
    );
  });
});

// Finalizar empeño (pagar total)
router.post('/:id/finalizar', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM empenos WHERE id_empeno = ? AND id_usuario = ?', [id, req.user.id], (err, empeno) => {
    if (err || !empeno) {
      return res.status(404).json({ error: 'Empeño no encontrado' });
    }

    db.run('UPDATE empenos SET estado = ? WHERE id_empeno = ?', ['finalizado', id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al finalizar empeño' });
      }

      res.json({
        message: 'Empeño finalizado. Puede retirar su objeto.',
        monto_total: empeno.monto_prestado + empeno.interes
      });
    });
  });
});

// Obtener historial completo (empeños finalizados)
router.get('/historial', authMiddleware, (req, res) => {
  const query = `
    SELECT e.*, o.tipo, o.marca, o.modelo, o.descripcion, o.fotos
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    WHERE e.id_usuario = ? AND e.estado IN ('finalizado', 'recuperado', 'vencido')
    ORDER BY e.fecha_inicio DESC
  `;

  db.all(query, [req.user.id], (err, empenos) => {
    if (err) {
      console.error('Error al obtener historial:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    // Calcular duración y días vencidos si aplica
    empenos = empenos.map(e => {
      const inicio = new Date(e.fecha_inicio);
      const vencimiento = new Date(e.fecha_vencimiento);
      const hoy = new Date();
      const duracionDias = Math.ceil((vencimiento - inicio) / (1000 * 60 * 60 * 24));
      let diasVencidos = 0;
      
      if (e.estado === 'vencido') {
        diasVencidos = Math.ceil((hoy - vencimiento) / (1000 * 60 * 60 * 24));
      }
      
      return { ...e, duracion_dias: duracionDias, dias_vencidos: diasVencidos };
    });

    res.json(empenos);
  });
});

// Listar todos los empeños (admin)
router.get('/todos', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT e.*, o.tipo, o.marca, o.modelo, u.nombre as usuario_nombre, u.dni
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    ORDER BY e.fecha_inicio DESC
  `;

  db.all(query, [], (err, empenos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(empenos);
  });
});

module.exports = router;
