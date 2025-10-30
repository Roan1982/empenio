const { db } = require('../config/database');

// Script para crear notificaciones de ejemplo

const crearNotificacionesEjemplo = () => {
  const notificaciones = [
    {
      id_usuario: 1, // Admin
      tipo: 'cita_pendiente',
      mensaje: 'Hay 3 citas pendientes de confirmar',
      leida: 0
    },
    {
      id_usuario: 1, // Admin
      tipo: 'empeno_vencido',
      mensaje: '2 empeños han vencido y requieren atención',
      leida: 0
    },
    {
      id_usuario: 2, // Usuario normal
      tipo: 'cita_confirmada',
      mensaje: 'Tu cita ha sido confirmada para el 15 de Marzo',
      leida: 0
    },
    {
      id_usuario: 2, // Usuario normal
      tipo: 'pago_proximo',
      mensaje: 'Tu pago vence en 5 días. Monto: $2,500',
      leida: 0
    }
  ];

  notificaciones.forEach((notif) => {
    db.run(`
      INSERT INTO notificaciones (id_usuario, tipo, mensaje, leida, fecha_creacion)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [notif.id_usuario, notif.tipo, notif.mensaje, notif.leida], function(err) {
      if (err) {
        console.error('Error creando notificación:', err);
      } else {
        console.log(`✅ Notificación creada: ${notif.mensaje}`);
      }
    });
  });

  setTimeout(() => {
    console.log('\n✨ Notificaciones de ejemplo creadas exitosamente!');
    db.close();
    process.exit(0);
  }, 1000);
};

// Ejecutar
crearNotificacionesEjemplo();
