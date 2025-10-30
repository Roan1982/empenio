const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/empenio.db');

const notificaciones = [
  {
    id_usuario: 1,
    tipo: 'cita_pendiente',
    mensaje: 'Hay 3 citas pendientes de confirmar',
    leida: 0
  },
  {
    id_usuario: 1,
    tipo: 'empeno_vencido',
    mensaje: '2 empeños han vencido y requieren atención',
    leida: 0
  },
  {
    id_usuario: 1,
    tipo: 'pago_proximo',
    mensaje: 'Un empeño vence en 2 días - Acción requerida',
    leida: 0
  },
  {
    id_usuario: 2,
    tipo: 'cita_confirmada',
    mensaje: 'Tu cita ha sido confirmada para mañana',
    leida: 0
  },
  {
    id_usuario: 2,
    tipo: 'pago_proximo',
    mensaje: 'Tu pago vence en 5 días. Monto: $2,500',
    leida: 0
  },
  {
    id_usuario: 2,
    tipo: 'empeno_creado',
    mensaje: 'Tu empeño ha sido creado exitosamente. ID: #EMP-001',
    leida: 1
  }
];

let insertados = 0;

notificaciones.forEach((notif) => {
  db.run(`
    INSERT INTO notificaciones (id_usuario, tipo, mensaje, leida, fecha_creacion)
    VALUES (?, ?, ?, ?, datetime('now'))
  `, [notif.id_usuario, notif.tipo, notif.mensaje, notif.leida], function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
    } else {
      insertados++;
      console.log(`✅ Notificación ${insertados}: ${notif.mensaje}`);
    }
    
    if (insertados === notificaciones.length) {
      console.log(`\n🎉 ${insertados} notificaciones creadas exitosamente!`);
      db.close();
    }
  });
});
