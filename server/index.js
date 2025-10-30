const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Inicializar base de datos
const db = require('./config/database');
db.initialize();

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/objetos', require('./routes/objetos'));
app.use('/api/empenos', require('./routes/empenos'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/precotizacion', require('./routes/precotizacion'));

// Servir archivos estáticos del cliente en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_PATH}`);
  console.log(`🤖 API IA: ${process.env.IA_API_URL}`);
});
