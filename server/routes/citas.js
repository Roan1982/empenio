const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Solicitar cita
router.post('/solicitar', authMiddleware, (req, res) => {
  const { id_precotizacion, fecha, hora, notas } = req.body;

  db.run(
    `INSERT INTO citas (id_usuario, id_precotizacion, fecha, hora, estado, notas)
     VALUES (?, ?, ?, ?, 'pendiente', ?)`,
    [req.user.id, id_precotizacion, fecha, hora, notas],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear cita' });
      }

      res.json({
        message: 'Cita solicitada exitosamente',
        id_cita: this.lastID,
        fecha,
        hora
      });
    }
  );
});

// Obtener mis citas
router.get('/mis-citas', authMiddleware, (req, res) => {
  const query = `
    SELECT c.*, p.resultado_valor, o.tipo, o.marca, o.modelo
    FROM citas c
    LEFT JOIN precotizaciones p ON c.id_precotizacion = p.id_analisis
    LEFT JOIN objetos o ON p.id_objeto = o.id_objeto
    WHERE c.id_usuario = ?
    ORDER BY c.fecha DESC, c.hora DESC
  `;

  db.all(query, [req.user.id], (err, citas) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(citas);
  });
});

// Listar todas las citas (admin)
router.get('/todas', authMiddleware, isAdmin, (req, res) => {
  const query = `
    SELECT c.*, u.nombre as usuario_nombre, u.dni, u.contacto,
           p.resultado_valor, o.tipo, o.marca, o.modelo
    FROM citas c
    JOIN usuarios u ON c.id_usuario = u.id_usuario
    LEFT JOIN precotizaciones p ON c.id_precotizacion = p.id_analisis
    LEFT JOIN objetos o ON p.id_objeto = o.id_objeto
    ORDER BY c.fecha DESC, c.hora DESC
  `;

  db.all(query, [], (err, citas) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(citas);
  });
});

// Confirmar cita (admin)
router.put('/:id/confirmar', authMiddleware, isAdmin, (req, res) => {
  db.run('UPDATE citas SET estado = ? WHERE id_cita = ?', ['confirmada', req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al confirmar cita' });
    }
    res.json({ message: 'Cita confirmada exitosamente' });
  });
});

// Cancelar cita
router.put('/:id/cancelar', authMiddleware, (req, res) => {
  db.run(
    'UPDATE citas SET estado = ? WHERE id_cita = ? AND id_usuario = ?',
    ['cancelada', req.params.id, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cancelar cita' });
      }
      res.json({ message: 'Cita cancelada exitosamente' });
    }
  );
});

module.exports = router;
