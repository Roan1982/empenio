const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'config', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Función para generar datos aleatorios
const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Laura', 'Miguel', 'Isabel', 
                 'Francisco', 'Patricia', 'Antonio', 'Rosa', 'Manuel', 'Teresa', 'Pedro', 'Marta', 'Javier', 'Elena',
                 'Diego', 'Sofía', 'Raúl', 'Lucía', 'Alberto', 'Cristina', 'Fernando', 'Beatriz', 'Roberto', 'Silvia',
                 'Sergio', 'Andrea', 'Daniel', 'Natalia', 'Pablo', 'Victoria', 'Alejandro', 'Gabriela', 'Jorge', 'Adriana'];

const apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
                   'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz', 'Chávez', 'Ruiz',
                   'Hernández', 'Jiménez', 'Mendoza', 'Castillo', 'Vargas', 'Romero', 'Herrera', 'Medina', 'Aguilar', 'Castro',
                   'Vega', 'León', 'Ramos', 'Fernández', 'Silva', 'Moreno', 'Álvarez', 'Muñoz', 'Guerrero', 'Campos'];

const tiposArticulo = [
    { tipo: 'Electrónica', articulos: ['Laptop HP', 'iPhone 13', 'Samsung Galaxy S21', 'iPad Air', 'MacBook Pro', 'TV LG 55"', 'PlayStation 5', 'Xbox Series X', 'Cámara Canon', 'Auriculares Sony'] },
    { tipo: 'Joyería', articulos: ['Anillo de oro 18k', 'Collar de plata', 'Pulsera de diamantes', 'Reloj Rolex', 'Aretes de esmeralda', 'Cadena de oro', 'Anillo de compromiso', 'Broche antiguo', 'Reloj Omega', 'Dije de oro'] },
    { tipo: 'Herramientas', articulos: ['Taladro Bosch', 'Sierra eléctrica', 'Compresor', 'Set de llaves', 'Soldadora', 'Esmeril', 'Generador eléctrico', 'Cortadora de césped', 'Motocierra Stihl', 'Juego de brocas'] },
    { tipo: 'Instrumentos', articulos: ['Guitarra Fender', 'Piano Yamaha', 'Batería Pearl', 'Violín', 'Saxofón', 'Bajo eléctrico', 'Trompeta', 'Teclado Casio', 'Acordeón', 'Amplificador Marshall'] },
    { tipo: 'Vehículos', articulos: ['Motocicleta Honda', 'Bicicleta Trek', 'Scooter eléctrico', 'Cuatrimoto Yamaha', 'Go Kart', 'Moto Suzuki', 'Bicicleta BMX', 'Patineta eléctrica', 'Moto Kawasaki', 'Mountain Bike'] }
];

const estados = ['activo', 'vencido', 'renovado', 'pagado'];
const estadosCita = ['pendiente', 'confirmada', 'cancelada', 'completada'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
    return array[randomInt(0, array.length - 1)];
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function generarTelefono() {
    return `${randomInt(600, 699)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

function generarEmail(nombre, apellido, index) {
    const dominios = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    return `${nombre.toLowerCase()}.${apellido.toLowerCase()}${index}@${randomElement(dominios)}`;
}

async function limpiarBaseDatos() {
    console.log('🧹 Limpiando base de datos...');
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Eliminar datos excepto admin
            db.run("DELETE FROM notificaciones", (err) => {
                if (err) console.error('Error limpiando notificaciones:', err);
            });
            db.run("DELETE FROM contratos_firmados", (err) => {
                if (err) console.error('Error limpiando contratos_firmados:', err);
            });
            db.run("DELETE FROM pagos", (err) => {
                if (err) console.error('Error limpiando pagos:', err);
            });
            db.run("DELETE FROM empenos", (err) => {
                if (err) console.error('Error limpiando empenos:', err);
            });
            db.run("DELETE FROM cotizaciones", (err) => {
                if (err) console.error('Error limpiando cotizaciones:', err);
            });
            db.run("DELETE FROM citas", (err) => {
                if (err) console.error('Error limpiando citas:', err);
            });
            db.run("DELETE FROM usuarios WHERE rol != 'admin'", (err) => {
                if (err) {
                    console.error('Error limpiando usuarios:', err);
                    reject(err);
                } else {
                    console.log('✅ Base de datos limpiada\n');
                    resolve();
                }
            });
        });
    });
}

async function crearUsuarios() {
    console.log('👥 Creando 40 usuarios...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usuarios = [];
    
    for (let i = 1; i <= 40; i++) {
        const nombre = randomElement(nombres);
        const apellido = randomElement(apellidos);
        const usuario = {
            nombre: `${nombre} ${apellido}`,
            email: generarEmail(nombre, apellido, i),
            password: hashedPassword,
            telefono: generarTelefono(),
            direccion: `Calle ${randomInt(1, 100)} #${randomInt(1, 999)}, Col. ${randomElement(['Centro', 'Norte', 'Sur', 'Este', 'Oeste'])}`,
            fecha_registro: formatDate(randomDate(new Date(2024, 0, 1), new Date()))
        };
        usuarios.push(usuario);
    }
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol, fecha_registro)
            VALUES (?, ?, ?, ?, ?, 'cliente', ?)
        `);
        
        let insertedCount = 0;
        usuarios.forEach((u, index) => {
            stmt.run([u.nombre, u.email, u.password, u.telefono, u.direccion, u.fecha_registro], (err) => {
                if (err) {
                    console.error(`Error insertando usuario ${index + 1}:`, err);
                } else {
                    insertedCount++;
                }
                
                if (insertedCount === usuarios.length) {
                    stmt.finalize();
                    console.log(`✅ ${insertedCount} usuarios creados\n`);
                    resolve();
                }
            });
        });
    });
}

async function obtenerUsuarios() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id FROM usuarios WHERE rol = 'cliente'", (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.id));
        });
    });
}

async function crearCotizaciones(usuarioIds) {
    console.log('💰 Creando cotizaciones...');
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO cotizaciones (usuario_id, tipo_articulo, descripcion, valor_estimado, monto_prestamo, tasa_interes, plazo_dias, fecha_cotizacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let insertedCount = 0;
        const totalCotizaciones = usuarioIds.length * randomInt(1, 3); // 1-3 cotizaciones por usuario
        
        usuarioIds.forEach(userId => {
            const numCotizaciones = randomInt(1, 3);
            
            for (let i = 0; i < numCotizaciones; i++) {
                const tipoObj = randomElement(tiposArticulo);
                const articulo = randomElement(tipoObj.articulos);
                const valorEstimado = randomInt(1000, 50000);
                const montoPrestamo = Math.floor(valorEstimado * randomInt(40, 70) / 100);
                const tasaInteres = randomInt(3, 7);
                const plazoDias = randomElement([30, 60, 90, 120]);
                const fechaCotizacion = formatDate(randomDate(new Date(2024, 6, 1), new Date()));
                
                stmt.run([userId, tipoObj.tipo, articulo, valorEstimado, montoPrestamo, tasaInteres, plazoDias, fechaCotizacion], (err) => {
                    if (err) console.error('Error insertando cotización:', err);
                    insertedCount++;
                    
                    if (insertedCount >= totalCotizaciones) {
                        stmt.finalize();
                        console.log(`✅ ${insertedCount} cotizaciones creadas\n`);
                        resolve();
                    }
                });
            }
        });
    });
}

async function obtenerCotizaciones() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, usuario_id FROM cotizaciones", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function crearCitas(cotizaciones) {
    console.log('📅 Creando citas...');
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO citas (usuario_id, cotizacion_id, fecha_cita, hora, estado, notas)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        let insertedCount = 0;
        // 70% de cotizaciones generan citas
        const cotizacionesConCita = cotizaciones.filter(() => Math.random() < 0.7);
        
        cotizacionesConCita.forEach(cot => {
            const fechaCita = formatDate(randomDate(new Date(2024, 7, 1), new Date(2025, 11, 31)));
            const hora = `${randomInt(9, 17)}:${randomElement(['00', '30'])}`;
            const estado = randomElement(estadosCita);
            const notas = `Cita para evaluar artículo de la cotización #${cot.id}`;
            
            stmt.run([cot.usuario_id, cot.id, fechaCita, hora, estado, notas], (err) => {
                if (err) console.error('Error insertando cita:', err);
                insertedCount++;
                
                if (insertedCount >= cotizacionesConCita.length) {
                    stmt.finalize();
                    console.log(`✅ ${insertedCount} citas creadas\n`);
                    resolve();
                }
            });
        });
    });
}

async function obtenerCitas() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, usuario_id, cotizacion_id FROM citas WHERE estado IN ('confirmada', 'completada')", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function crearEmpenos(citas) {
    console.log('💎 Creando empeños...');
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO empenos (usuario_id, cotizacion_id, cita_id, articulo, descripcion, valor_avaluo, 
                                monto_prestado, interes, plazo_dias, fecha_inicio, fecha_vencimiento, estado, codigo_qr)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let insertedCount = 0;
        
        citas.forEach((cita, index) => {
            db.get("SELECT * FROM cotizaciones WHERE id = ?", [cita.cotizacion_id], (err, cotizacion) => {
                if (err || !cotizacion) {
                    insertedCount++;
                    if (insertedCount >= citas.length) {
                        stmt.finalize();
                        console.log(`✅ Empeños creados\n`);
                        resolve();
                    }
                    return;
                }
                
                const fechaInicio = new Date(randomDate(new Date(2024, 8, 1), new Date()));
                const plazoDias = cotizacion.plazo_dias;
                const fechaVencimiento = new Date(fechaInicio);
                fechaVencimiento.setDate(fechaVencimiento.getDate() + plazoDias);
                
                const estado = randomElement(estados);
                const codigoQr = `EMP-${String(index + 1).padStart(6, '0')}`;
                
                stmt.run([
                    cita.usuario_id,
                    cita.cotizacion_id,
                    cita.id,
                    cotizacion.tipo_articulo,
                    cotizacion.descripcion,
                    cotizacion.valor_estimado,
                    cotizacion.monto_prestamo,
                    cotizacion.tasa_interes,
                    plazoDias,
                    formatDate(fechaInicio),
                    formatDate(fechaVencimiento),
                    estado,
                    codigoQr
                ], (err) => {
                    if (err) console.error('Error insertando empeño:', err);
                    insertedCount++;
                    
                    if (insertedCount >= citas.length) {
                        stmt.finalize();
                        console.log(`✅ ${insertedCount} empeños creados\n`);
                        resolve();
                    }
                });
            });
        });
    });
}

async function obtenerEmpenos() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, usuario_id, monto_prestado, interes, fecha_inicio, estado FROM empenos", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function crearPagos(empenos) {
    console.log('💳 Creando pagos...');
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO pagos (empeno_id, usuario_id, monto, fecha_pago, metodo_pago, tipo_pago, referencia)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        let insertedCount = 0;
        let totalPagos = 0;
        
        // Solo empeños activos o renovados tienen pagos
        const empenosConPagos = empenos.filter(e => e.estado === 'activo' || e.estado === 'renovado' || e.estado === 'pagado');
        
        empenosConPagos.forEach(empeno => {
            const numPagos = empeno.estado === 'pagado' ? randomInt(1, 4) : randomInt(1, 2);
            totalPagos += numPagos;
            
            for (let i = 0; i < numPagos; i++) {
                const fechaInicio = new Date(empeno.fecha_inicio);
                const fechaPago = new Date(fechaInicio);
                fechaPago.setDate(fechaPago.getDate() + randomInt(5, 60));
                
                const montoInteres = (empeno.monto_prestado * empeno.interes) / 100;
                const montoPago = i === numPagos - 1 && empeno.estado === 'pagado' 
                    ? empeno.monto_prestado + montoInteres 
                    : montoInteres;
                
                const metodoPago = randomElement(['efectivo', 'tarjeta', 'transferencia']);
                const tipoPago = i === numPagos - 1 && empeno.estado === 'pagado' ? 'total' : 'interes';
                const referencia = `PAY-${String(Date.now() + i).slice(-8)}`;
                
                stmt.run([
                    empeno.id,
                    empeno.usuario_id,
                    montoPago,
                    formatDate(fechaPago),
                    metodoPago,
                    tipoPago,
                    referencia
                ], (err) => {
                    if (err) console.error('Error insertando pago:', err);
                    insertedCount++;
                    
                    if (insertedCount >= totalPagos) {
                        stmt.finalize();
                        console.log(`✅ ${insertedCount} pagos creados\n`);
                        resolve();
                    }
                });
            }
        });
        
        if (totalPagos === 0) {
            stmt.finalize();
            console.log('✅ No se crearon pagos (no hay empeños elegibles)\n');
            resolve();
        }
    });
}

async function crearNotificaciones(usuarioIds) {
    console.log('🔔 Creando notificaciones...');
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const tiposNotificacion = [
            { tipo: 'cita', titulo: 'Cita confirmada', mensaje: 'Tu cita ha sido confirmada para mañana a las 10:00 AM' },
            { tipo: 'pago', titulo: 'Pago próximo a vencer', mensaje: 'Tu pago de intereses vence en 3 días' },
            { tipo: 'empeno', titulo: 'Empeño creado', mensaje: 'Tu empeño ha sido creado exitosamente' },
            { tipo: 'alerta', titulo: 'Empeño próximo a vencer', mensaje: 'Tu empeño vence en 5 días' },
            { tipo: 'renovacion', titulo: 'Renovación disponible', mensaje: 'Puedes renovar tu empeño' }
        ];
        
        let insertedCount = 0;
        const totalNotificaciones = usuarioIds.length * 2; // 2 notificaciones por usuario
        
        usuarioIds.forEach(userId => {
            for (let i = 0; i < 2; i++) {
                const notif = randomElement(tiposNotificacion);
                const leida = Math.random() < 0.3 ? 1 : 0;
                const fechaCreacion = new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString();
                
                stmt.run([userId, notif.tipo, notif.titulo, notif.mensaje, leida, fechaCreacion], (err) => {
                    if (err) console.error('Error insertando notificación:', err);
                    insertedCount++;
                    
                    if (insertedCount >= totalNotificaciones) {
                        stmt.finalize();
                        console.log(`✅ ${insertedCount} notificaciones creadas\n`);
                        resolve();
                    }
                });
            }
        });
        
        // Notificaciones para admin
        const notifAdmin = [
            { tipo: 'sistema', titulo: 'Citas pendientes', mensaje: 'Hay 8 citas pendientes de confirmar' },
            { tipo: 'sistema', titulo: 'Empeños vencidos', mensaje: '5 empeños han vencido hoy' },
            { tipo: 'sistema', titulo: 'Pagos del día', mensaje: 'Se han recibido 12 pagos hoy' }
        ];
        
        notifAdmin.forEach(notif => {
            stmt.run([1, notif.tipo, notif.titulo, notif.mensaje, 0, new Date().toISOString()], (err) => {
                if (err) console.error('Error insertando notificación admin:', err);
            });
        });
    });
}

async function main() {
    console.log('🚀 Iniciando carga de datos...\n');
    
    try {
        await limpiarBaseDatos();
        await crearUsuarios();
        
        const usuarioIds = await obtenerUsuarios();
        console.log(`📊 Usuarios obtenidos: ${usuarioIds.length}\n`);
        
        await crearCotizaciones(usuarioIds);
        const cotizaciones = await obtenerCotizaciones();
        console.log(`📊 Cotizaciones obtenidas: ${cotizaciones.length}\n`);
        
        await crearCitas(cotizaciones);
        const citas = await obtenerCitas();
        console.log(`📊 Citas confirmadas/completadas: ${citas.length}\n`);
        
        await crearEmpenos(citas);
        const empenos = await obtenerEmpenos();
        console.log(`📊 Empeños creados: ${empenos.length}\n`);
        
        await crearPagos(empenos);
        await crearNotificaciones(usuarioIds);
        
        console.log('\n✅ ¡Base de datos poblada exitosamente!\n');
        console.log('📈 Resumen:');
        console.log(`   - 40 usuarios creados`);
        console.log(`   - ${cotizaciones.length} cotizaciones`);
        console.log(`   - ${citas.length} citas`);
        console.log(`   - ${empenos.length} empeños`);
        console.log(`   - Pagos y notificaciones generados`);
        console.log('\n🌐 Puedes visualizar los datos en http://localhost:3000');
        console.log('   Usuario: user@empenio.com');
        console.log('   Password: password123');
        console.log('   Admin: admin@empenio.com / admin123\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

main();
