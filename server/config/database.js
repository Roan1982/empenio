const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'database', 'empenio.db');
const dbDir = path.dirname(dbPath);

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
  }
});

const initialize = () => {
  db.serialize(() => {
    // Tabla Usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        dni TEXT UNIQUE NOT NULL,
        contacto TEXT NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        rol TEXT DEFAULT 'usuario',
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Administradores
    db.run(`
      CREATE TABLE IF NOT EXISTS administradores (
        id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        contacto TEXT,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Objetos
    db.run(`
      CREATE TABLE IF NOT EXISTS objetos (
        id_objeto INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        marca TEXT,
        modelo TEXT,
        descripcion TEXT NOT NULL,
        estado TEXT NOT NULL,
        antiguedad INTEGER,
        fotos TEXT,
        video TEXT,
        valor_estimado REAL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Pre-cotizaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS precotizaciones (
        id_analisis INTEGER PRIMARY KEY AUTOINCREMENT,
        id_objeto INTEGER,
        id_usuario INTEGER,
        resultado_valor REAL NOT NULL,
        confiabilidad REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_objeto) REFERENCES objetos(id_objeto),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      )
    `);

    // Tabla Empeños
    db.run(`
      CREATE TABLE IF NOT EXISTS empenos (
        id_empeno INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_objeto INTEGER NOT NULL,
        monto_prestado REAL NOT NULL,
        interes REAL NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        estado TEXT DEFAULT 'activo',
        renovaciones INTEGER DEFAULT 0,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_objeto) REFERENCES objetos(id_objeto)
      )
    `);

    // Tabla Citas
    db.run(`
      CREATE TABLE IF NOT EXISTS citas (
        id_cita INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_precotizacion INTEGER,
        fecha DATE NOT NULL,
        hora TEXT NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        notas TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_precotizacion) REFERENCES precotizaciones(id_analisis)
      )
    `);

    // Tabla Renovaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS renovaciones (
        id_renovacion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_empeno INTEGER NOT NULL,
        monto_pagado REAL NOT NULL,
        fecha_renovacion DATE NOT NULL,
        nueva_fecha_vencimiento DATE NOT NULL,
        FOREIGN KEY (id_empeno) REFERENCES empenos(id_empeno)
      )
    `);

    // Insertar admin por defecto
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`
      INSERT OR IGNORE INTO administradores (nombre, email, password, contacto)
      VALUES ('Administrador', 'admin@empenio.com', ?, '1234567890')
    `, [adminPassword]);

    console.log('✅ Tablas de base de datos creadas correctamente');
  });
};

module.exports = { db, initialize };
