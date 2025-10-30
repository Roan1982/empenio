const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// ============================================
// ESTADÍSTICAS Y DASHBOARD
// ============================================

// Obtener estadísticas generales
router.get('/estadisticas', authMiddleware, isAdmin, (req, res) => {
  const queries = {
    totalUsuarios: 'SELECT COUNT(*) as total FROM usuarios',
    totalEmpenos: 'SELECT COUNT(*) as total FROM empenos',
    empenosActivos: 'SELECT COUNT(*) as total FROM empenos WHERE estado = "activo"',
    citasPendientes: 'SELECT COUNT(*) as total FROM citas WHERE estado = "pendiente"',
    montoTotal: 'SELECT SUM(monto_prestado) as total FROM empenos WHERE estado = "activo"',
    interesesGenerados: 'SELECT SUM(interes) as total FROM empenos',
    objetosEmpenados: 'SELECT COUNT(DISTINCT id_objeto) as total FROM empenos WHERE estado = "activo"'
  };

  const estadisticas = {};
  let completados = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, result) => {
      if (err) {
        console.error(`Error en query ${key}:`, err);
        estadisticas[key] = 0;
      } else {
        estadisticas[key] = result.total || 0;
      }
      
      completados++;
      if (completados === totalQueries) {
        res.json(estadisticas);
      }
    });
  });
});

// Obtener empeños por vencer (próximos 7 días)
router.get('/empenos-por-vencer', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT e.*, o.tipo, o.marca, o.modelo, u.nombre as usuario_nombre, u.contacto
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE e.estado = 'activo' 
    AND date(e.fecha_vencimiento) BETWEEN date('now') AND date('now', '+7 days')
    ORDER BY e.fecha_vencimiento ASC
  `;

  db.all(query, [], (err, empenos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(empenos);
  });
});

// Obtener empeños vencidos
router.get('/empenos-vencidos', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT e.*, o.tipo, o.marca, o.modelo, u.nombre as usuario_nombre, u.contacto, u.email
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE e.estado = 'activo' 
    AND date(e.fecha_vencimiento) < date('now')
    ORDER BY e.fecha_vencimiento ASC
  `;

  db.all(query, [], (err, empenos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(empenos);
  });
});

// Reportes mensuales
router.get('/reporte-mensual', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', fecha_inicio) as mes,
      COUNT(*) as total_empenos,
      SUM(monto_prestado) as monto_total,
      SUM(interes) as intereses_total
    FROM empenos
    WHERE fecha_inicio >= date('now', '-12 months')
    GROUP BY mes
    ORDER BY mes DESC
  `;

  db.all(query, [], (err, reporte) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(reporte);
  });
});

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

// Listar todos los usuarios
router.get('/usuarios', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT u.*, 
           COUNT(DISTINCT e.id_empeno) as total_empenos,
           COUNT(DISTINCT CASE WHEN e.estado = 'activo' THEN e.id_empeno END) as empenos_activos,
           SUM(CASE WHEN e.estado = 'activo' THEN e.monto_prestado ELSE 0 END) as deuda_total
    FROM usuarios u
    LEFT JOIN empenos e ON u.id_usuario = e.id_usuario
    GROUP BY u.id_usuario
    ORDER BY u.fecha_registro DESC
  `;

  db.all(query, [], (err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(usuarios);
  });
});

// Buscar usuario por DNI o nombre
router.get('/usuarios/buscar', authMiddleware, isAdmin, (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
  }

  const query = `
    SELECT u.*, 
           COUNT(DISTINCT e.id_empeno) as total_empenos,
           COUNT(DISTINCT CASE WHEN e.estado = 'activo' THEN e.id_empeno END) as empenos_activos
    FROM usuarios u
    LEFT JOIN empenos e ON u.id_usuario = e.id_usuario
    WHERE u.dni LIKE ? OR u.nombre LIKE ? OR u.email LIKE ?
    GROUP BY u.id_usuario
  `;

  const searchTerm = `%${q}%`;
  db.all(query, [searchTerm, searchTerm, searchTerm], (err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(usuarios);
  });
});

// Obtener detalle completo de un usuario
router.get('/usuarios/:id', authMiddleware, isAdmin, (req, res) => {
  const userId = req.params.id;

  // Información básica del usuario
  db.get('SELECT * FROM usuarios WHERE id_usuario = ?', [userId], (err, usuario) => {
    if (err || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Empeños del usuario
    const empenosQuery = `
      SELECT e.*, o.tipo, o.marca, o.modelo, o.descripcion
      FROM empenos e
      JOIN objetos o ON e.id_objeto = o.id_objeto
      WHERE e.id_usuario = ?
      ORDER BY e.fecha_inicio DESC
    `;

    db.all(empenosQuery, [userId], (err, empenos) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cargar empeños' });
      }

      // Citas del usuario
      const citasQuery = `
        SELECT c.*, p.resultado_valor, o.tipo, o.marca
        FROM citas c
        LEFT JOIN precotizaciones p ON c.id_precotizacion = p.id_analisis
        LEFT JOIN objetos o ON p.id_objeto = o.id_objeto
        WHERE c.id_usuario = ?
        ORDER BY c.fecha DESC
      `;

      db.all(citasQuery, [userId], (err, citas) => {
        if (err) {
          return res.status(500).json({ error: 'Error al cargar citas' });
        }

        res.json({
          usuario,
          empenos,
          citas
        });
      });
    });
  });
});

// ============================================
// GESTIÓN DE EMPEÑOS (ADMIN)
// ============================================

// Cambiar estado de empeño
router.put('/empenos/:id/estado', authMiddleware, isAdmin, (req, res) => {
  const { id } = req.params;
  const { estado, notas } = req.body;

  const estadosValidos = ['activo', 'finalizado', 'vencido', 'recuperado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  db.run(
    'UPDATE empenos SET estado = ?, notas = ? WHERE id_empeno = ?',
    [estado, notas || null, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar estado' });
      }
      res.json({ message: 'Estado actualizado exitosamente' });
    }
  );
});

// Crear empeño desde admin
router.post('/empenos/crear', authMiddleware, isAdmin, (req, res) => {
  const {
    id_usuario,
    tipo,
    marca,
    modelo,
    descripcion,
    estado_objeto,
    antiguedad,
    monto_prestado,
    interes,
    plazo_dias
  } = req.body;

  // Primero crear el objeto
  db.run(
    `INSERT INTO objetos (tipo, marca, modelo, descripcion, estado, antiguedad)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo, marca, modelo, descripcion, estado_objeto, antiguedad],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear objeto' });
      }

      const idObjeto = this.lastID;
      const fechaInicio = new Date().toISOString().split('T')[0];
      const fechaVencimiento = new Date(Date.now() + (plazo_dias || 30) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // Crear el empeño
      db.run(
        `INSERT INTO empenos (id_usuario, id_objeto, monto_prestado, interes, fecha_inicio, fecha_vencimiento, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
        [id_usuario, idObjeto, monto_prestado, interes, fechaInicio, fechaVencimiento],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error al crear empeño' });
          }

          res.json({
            message: 'Empeño creado exitosamente',
            id_empeno: this.lastID,
            id_objeto: idObjeto,
            fecha_vencimiento: fechaVencimiento
          });
        }
      );
    }
  );
});

// ============================================
// GESTIÓN DE OBJETOS
// ============================================

// Listar todos los objetos
router.get('/objetos', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT o.*, 
           e.estado as estado_empeno,
           e.monto_prestado,
           e.fecha_vencimiento,
           u.nombre as propietario
    FROM objetos o
    LEFT JOIN empenos e ON o.id_objeto = e.id_objeto AND e.estado = 'activo'
    LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
    ORDER BY o.fecha_registro DESC
  `;

  db.all(query, [], (err, objetos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(objetos);
  });
});

// Obtener detalle completo de un objeto
router.get('/objetos/:id', authMiddleware, isAdmin, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT o.*, 
           e.id_empeno,
           e.estado as estado_empeno,
           e.monto_prestado,
           e.interes,
           e.fecha_inicio as empeno_fecha_inicio,
           e.fecha_vencimiento,
           e.renovaciones,
           u.id_usuario,
           u.nombre as propietario,
           u.dni as dni_propietario,
           u.contacto as contacto_propietario,
           p.resultado_valor as resultado_ia,
           p.confianza as confianza_ia
    FROM objetos o
    LEFT JOIN empenos e ON o.id_objeto = e.id_objeto AND e.estado = 'activo'
    LEFT JOIN usuarios u ON o.id_usuario_propietario = u.id_usuario
    LEFT JOIN precotizaciones p ON o.id_objeto = p.id_objeto
    WHERE o.id_objeto = ?
  `;

  db.get(query, [id], (err, objeto) => {
    if (err) {
      console.error('Error al obtener objeto:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (!objeto) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }

    // Parsear fotos si es string JSON
    if (objeto.fotos && typeof objeto.fotos === 'string') {
      try {
        objeto.fotos = JSON.parse(objeto.fotos);
      } catch (e) {
        objeto.fotos = [];
      }
    }

    // Organizar información del empeño si existe
    if (objeto.id_empeno) {
      objeto.empeno_info = {
        id_empeno: objeto.id_empeno,
        monto_prestado: objeto.monto_prestado,
        interes: objeto.interes,
        fecha_inicio: objeto.empeno_fecha_inicio,
        fecha_vencimiento: objeto.fecha_vencimiento,
        renovaciones: objeto.renovaciones
      };
    }

    // Limpiar campos duplicados
    delete objeto.id_empeno;
    delete objeto.empeno_fecha_inicio;

    res.json(objeto);
  });
});

// Buscar objetos por tipo, marca o modelo
router.get('/objetos/buscar', authMiddleware, isAdmin, (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
  }

  const query = `
    SELECT o.*, 
           e.estado as estado_empeno,
           u.nombre as propietario
    FROM objetos o
    LEFT JOIN empenos e ON o.id_objeto = e.id_objeto AND e.estado = 'activo'
    LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE o.tipo LIKE ? OR o.marca LIKE ? OR o.modelo LIKE ?
    ORDER BY o.fecha_registro DESC
  `;

  const searchTerm = `%${q}%`;
  db.all(query, [searchTerm, searchTerm, searchTerm], (err, objetos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(objetos);
  });
});

// ============================================
// GESTIÓN DE CITAS AVANZADA
// ============================================

// Rechazar cita
router.put('/citas/:id/rechazar', authMiddleware, isAdmin, (req, res) => {
  const { motivo } = req.body;
  
  db.run(
    'UPDATE citas SET estado = ?, notas = ? WHERE id_cita = ?',
    ['cancelada', motivo, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al rechazar cita' });
      }
      res.json({ message: 'Cita rechazada' });
    }
  );
});

// Reagendar cita
router.put('/citas/:id/reagendar', authMiddleware, isAdmin, (req, res) => {
  const { fecha, hora, notas } = req.body;
  
  db.run(
    'UPDATE citas SET fecha = ?, hora = ?, notas = ?, estado = ? WHERE id_cita = ?',
    [fecha, hora, notas, 'confirmada', req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al reagendar cita' });
      }
      res.json({ message: 'Cita reagendada exitosamente' });
    }
  );
});

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

// Obtener configuración
router.get('/configuracion', authMiddleware, isAdmin, (req, res) => {
  db.all('SELECT * FROM configuracion', [], (err, config) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    
    const configObj = {};
    config.forEach(item => {
      configObj[item.clave] = item.valor;
    });
    
    res.json(configObj);
  });
});

// Actualizar configuración
router.put('/configuracion', authMiddleware, isAdmin, (req, res) => {
  const configuraciones = req.body;
  
  let actualizados = 0;
  const total = Object.keys(configuraciones).length;
  
  Object.entries(configuraciones).forEach(([clave, valor]) => {
    db.run(
      'INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?)',
      [clave, valor],
      (err) => {
        if (err) {
          console.error('Error al actualizar configuración:', err);
        }
        
        actualizados++;
        if (actualizados === total) {
          res.json({ message: 'Configuración actualizada' });
        }
      }
    );
  });
});

// ============================================
// REPORTES Y EXPORTACIÓN
// ============================================

// Reporte de empeños por categoría
router.get('/reportes/por-categoria', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT o.tipo, 
           COUNT(*) as cantidad,
           AVG(e.monto_prestado) as monto_promedio,
           SUM(e.monto_prestado) as monto_total
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    WHERE e.estado = 'activo'
    GROUP BY o.tipo
    ORDER BY cantidad DESC
  `;

  db.all(query, [], (err, reporte) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(reporte);
  });
});

// Reporte de renovaciones
router.get('/reportes/renovaciones', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT r.*, e.monto_prestado, u.nombre as usuario_nombre, o.tipo, o.marca
    FROM renovaciones r
    JOIN empenos e ON r.id_empeno = e.id_empeno
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    JOIN objetos o ON e.id_objeto = o.id_objeto
    ORDER BY r.fecha_renovacion DESC
    LIMIT 100
  `;

  db.all(query, [], (err, renovaciones) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(renovaciones);
  });
});

// Top usuarios por monto empeñado
router.get('/reportes/top-usuarios', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT u.*, 
           COUNT(e.id_empeno) as total_empenos,
           SUM(e.monto_prestado) as monto_total,
           SUM(e.interes) as intereses_pagados
    FROM usuarios u
    JOIN empenos e ON u.id_usuario = e.id_usuario
    GROUP BY u.id_usuario
    ORDER BY monto_total DESC
    LIMIT 20
  `;

  db.all(query, [], (err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(usuarios);
  });
});

module.exports = router;
