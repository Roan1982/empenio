const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/database/empenio.db');

const query = `
  SELECT tipo, COUNT(*) as cantidad 
  FROM notificaciones 
  WHERE tipo IN ('cita_pendiente', 'empeno_vencido', 'pago_vencido')
  GROUP BY tipo
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('📊 Notificaciones visibles para Admin:');
    rows.forEach(r => console.log(`   ${r.tipo}: ${r.cantidad}`));
  }
  db.close();
});
