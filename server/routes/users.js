const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Obtener perfil del usuario
router.get('/profile', authMiddleware, (req, res) => {
  db.get(
    'SELECT id_usuario, nombre, dni, contacto, email, fecha_registro FROM usuarios WHERE id_usuario = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(user);
    }
  );
});

// Obtener historial de empeños del usuario
router.get('/historial', authMiddleware, (req, res) => {
  const query = `
    SELECT e.*, o.tipo, o.marca, o.modelo, o.descripcion
    FROM empenos e
    JOIN objetos o ON e.id_objeto = o.id_objeto
    WHERE e.id_usuario = ?
    ORDER BY e.fecha_inicio DESC
  `;

  db.all(query, [req.user.id], (err, empenos) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(empenos);
  });
});

module.exports = router;
