const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/database/empenio.db');

console.log('🔔 Verificando notificaciones...\n');

db.all('SELECT COUNT(*) as total FROM notificaciones', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`📊 Total notificaciones: ${rows[0].total}\n`);
  
  db.all('SELECT tipo, COUNT(*) as cantidad FROM notificaciones GROUP BY tipo', [], (err2, rows2) => {
    if (err2) {
      console.error('Error:', err2);
    } else {
      console.log('📋 Notificaciones por tipo:');
      rows2.forEach(r => {
        console.log(`   ${r.tipo}: ${r.cantidad}`);
      });
    }
    
    console.log('\n📌 Primeras 5 notificaciones:');
    db.all('SELECT * FROM notificaciones LIMIT 5', [], (err3, rows3) => {
      if (!err3) {
        rows3.forEach((n, i) => {
          console.log(`\n   ${i+1}. [${n.tipo}] ${n.mensaje}`);
          console.log(`      Usuario ID: ${n.id_usuario}, Leída: ${n.leida ? 'Sí' : 'No'}`);
        });
      }
      db.close();
    });
  });
});
