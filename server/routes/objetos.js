const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes y videos'));
    }
  }
});

// Subir objeto con fotos y video
router.post('/upload', authMiddleware, upload.fields([
  { name: 'fotos', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const { tipo, marca, modelo, descripcion, estado, antiguedad } = req.body;

  const fotos = req.files['fotos'] ? req.files['fotos'].map(f => f.filename).join(',') : '';
  const video = req.files['video'] ? req.files['video'][0].filename : '';

  db.run(
    `INSERT INTO objetos (tipo, marca, modelo, descripcion, estado, antiguedad, fotos, video)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipo, marca, modelo, descripcion, estado, antiguedad, fotos, video],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar objeto' });
      }

      res.json({
        message: 'Objeto subido exitosamente',
        id_objeto: this.lastID,
        fotos: fotos.split(','),
        video
      });
    }
  );
});

// Obtener objeto por ID
router.get('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM objetos WHERE id_objeto = ?', [req.params.id], (err, objeto) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (!objeto) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    
    // Convertir strings de fotos a arrays
    if (objeto.fotos) {
      objeto.fotos = objeto.fotos.split(',');
    }
    
    res.json(objeto);
  });
});

module.exports = router;
