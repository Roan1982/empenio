const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/database/empenio.db');

db.all('SELECT nombre, email FROM usuarios WHERE rol = "usuario" ORDER BY id_usuario LIMIT 10', (err, rows) => {
    if (!err && rows) {
        console.log('\n📧 Primeros 10 usuarios creados:\n');
        rows.forEach(r => {
            console.log(`   ${r.nombre.padEnd(30)} - ${r.email}`);
        });
        console.log('\n   Password para todos: password123\n');
    }
    db.close();
});
