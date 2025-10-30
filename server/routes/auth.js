const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, dni, contacto, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    db.get('SELECT * FROM usuarios WHERE dni = ? OR email = ?', [dni, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      if (user) {
        return res.status(400).json({ error: 'Usuario ya existe' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar nuevo usuario
      db.run(
        'INSERT INTO usuarios (nombre, dni, contacto, email, password) VALUES (?, ?, ?, ?, ?)',
        [nombre, dni, contacto, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error al crear usuario' });
          }

          const token = jwt.sign(
            { id: this.lastID, dni, rol: 'usuario' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: this.lastID, nombre, dni, email, rol: 'usuario' }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login de usuario
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, dni: user.dni, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        dni: user.dni,
        email: user.email,
        rol: user.rol
      }
    });
  });
});

// Login de administrador
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM administradores WHERE email = ?', [email], async (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id_admin, email: admin.email, rol: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: admin.id_admin,
        nombre: admin.nombre,
        email: admin.email,
        rol: 'admin'
      }
    });
  });
});

module.exports = router;
