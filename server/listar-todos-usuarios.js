const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/database/empenio.db');

db.all('SELECT nombre, email, dni, contacto FROM usuarios WHERE rol = "usuario" ORDER BY id_usuario', (err, rows) => {
    if (!err && rows) {
        console.log('\n📧 LISTA COMPLETA DE 40 USUARIOS\n');
        console.log('='.repeat(80));
        console.log('\n');
        rows.forEach((r, index) => {
            console.log(`${String(index + 1).padStart(2, '0')}. ${r.nombre.padEnd(25)} | ${r.email.padEnd(35)} | DNI: ${r.dni} | Tel: ${r.contacto}`);
        });
        console.log('\n');
        console.log('='.repeat(80));
        console.log('\n🔑 Password para TODOS los usuarios: password123\n');
    }
    db.close();
});
