const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = '/app/database/empenio.db';
const db = new sqlite3.Database(dbPath);

// Datos aleatorios
const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Laura', 'Miguel', 'Isabel', 
                 'Francisco', 'Patricia', 'Antonio', 'Rosa', 'Manuel', 'Teresa', 'Pedro', 'Marta', 'Javier', 'Elena',
                 'Diego', 'Sofía', 'Raúl', 'Lucía', 'Alberto', 'Cristina', 'Fernando', 'Beatriz', 'Roberto', 'Silvia',
                 'Sergio', 'Andrea', 'Daniel', 'Natalia', 'Pablo', 'Victoria', 'Alejandro', 'Gabriela', 'Jorge', 'Adriana'];

const apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
                   'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz', 'Chávez', 'Ruiz',
                   'Hernández', 'Jiménez', 'Mendoza', 'Castillo', 'Vargas', 'Romero', 'Herrera', 'Medina', 'Aguilar', 'Castro',
                   'Vega', 'León', 'Ramos', 'Fernández', 'Silva', 'Moreno', 'Álvarez', 'Muñoz', 'Guerrero', 'Campos'];

const tiposObjeto = {
  'Electrónica': [
    { tipo: 'Laptop', marcas: ['HP', 'Dell', 'Lenovo', 'Acer'], modelos: ['Pavilion', 'Inspiron', 'ThinkPad', 'Aspire'] },
    { tipo: 'Smartphone', marcas: ['iPhone', 'Samsung', 'Xiaomi', 'Huawei'], modelos: ['13 Pro', 'Galaxy S21', 'Mi 11', 'P40'] },
    { tipo: 'Tablet', marcas: ['iPad', 'Samsung', 'Lenovo'], modelos: ['Air', 'Tab S7', 'Tab M10'] },
    { tipo: 'TV', marcas: ['LG', 'Samsung', 'Sony'], modelos: ['OLED 55"', 'QLED 65"', 'Bravia 50"'] }
  ],
  'Joyería': [
    { tipo: 'Anillo', marcas: ['Oro 18k', 'Platino', 'Plata 925'], modelos: ['Solitario', 'Compromiso', 'Alianza'] },
    { tipo: 'Collar', marcas: ['Oro 18k', 'Plata 925'], modelos: ['Cadena', 'Gargantilla', 'Riviere'] },
    { tipo: 'Reloj', marcas: ['Rolex', 'Omega', 'TAG Heuer'], modelos: ['Submariner', 'Seamaster', 'Carrera'] }
  ],
  'Herramientas': [
    { tipo: 'Taladro', marcas: ['Bosch', 'DeWalt', 'Makita'], modelos: ['GSB 13', 'DCD771', 'HP457D'] },
    { tipo: 'Sierra', marcas: ['Bosch', 'Stanley', 'DeWalt'], modelos: ['GKS 190', 'STSP125', 'DWE575'] },
    { tipo: 'Compresor', marcas: ['Truper', 'DeWalt', 'Porter'], modelos: ['COMP-50L', 'DXCMPA1982054', 'C2002'] }
  ],
  'Instrumentos': [
    { tipo: 'Guitarra', marcas: ['Fender', 'Gibson', 'Yamaha'], modelos: ['Stratocaster', 'Les Paul', 'FG800'] },
    { tipo: 'Bajo', marcas: ['Fender', 'Ibanez', 'Music Man'], modelos: ['Precision', 'SR500', 'StingRay'] }
  ]
};

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

function generarDNI() {
    return String(randomInt(10000000, 99999999));
}

function generarTelefono() {
    return `+57 ${randomInt(300, 350)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`;
}

function generarEmail(nombre, apellido) {
    const dominios = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    // Eliminar tildes y caracteres especiales
    const nombreLimpio = nombre.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, 'n');
    const apellidoLimpio = apellido.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, 'n');
    return `${nombreLimpio}.${apellidoLimpio}${randomInt(1, 999)}@${randomElement(dominios)}`;
}

async function limpiarDatos() {
    console.log('🧹 Limpiando datos anteriores...\n');
    
    return new Promise((resolve) => {
        db.serialize(() => {
            db.run("DELETE FROM notificaciones WHERE id_usuario IN (SELECT id_usuario FROM usuarios WHERE rol = 'usuario')");
            db.run("DELETE FROM pagos");
            db.run("DELETE FROM renovaciones");
            db.run("DELETE FROM empenos");
            db.run("DELETE FROM citas WHERE id_usuario IN (SELECT id_usuario FROM usuarios WHERE rol = 'usuario')");
            db.run("DELETE FROM precotizaciones WHERE id_usuario IN (SELECT id_usuario FROM usuarios WHERE rol = 'usuario')");
            db.run("DELETE FROM objetos");
            db.run("DELETE FROM usuarios WHERE rol = 'usuario'", (err) => {
                if (err) console.error('Error:', err);
                else {
                    console.log('✅ Datos limpiados\n');
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
    
    for (let i = 0; i < 40; i++) {
        const nombre = randomElement(nombres);
        const apellido = randomElement(apellidos);
        usuarios.push({
            nombre: `${nombre} ${apellido}`,
            dni: generarDNI(),
            contacto: generarTelefono(),
            email: generarEmail(nombre, apellido),
            password: hashedPassword
        });
    }
    
    return new Promise((resolve) => {
        const stmt = db.prepare(`
            INSERT INTO usuarios (nombre, dni, contacto, email, password, rol)
            VALUES (?, ?, ?, ?, ?, 'usuario')
        `);
        
        let count = 0;
        usuarios.forEach(u => {
            stmt.run([u.nombre, u.dni, u.contacto, u.email, u.password], (err) => {
                if (err) console.error('Error:', err);
                count++;
                if (count === usuarios.length) {
                    stmt.finalize();
                    console.log(`✅ 40 usuarios creados\n`);
                    resolve();
                }
            });
        });
    });
}

async function obtenerUsuarios() {
    return new Promise((resolve) => {
        db.all("SELECT id_usuario FROM usuarios WHERE rol = 'usuario'", (err, rows) => {
            resolve(rows || []);
        });
    });
}

async function crearObjetos(usuarios) {
    console.log('📦 Creando objetos...');
    
    return new Promise((resolve) => {
        const stmt = db.prepare(`
            INSERT INTO objetos (tipo, marca, modelo, descripcion, estado, antiguedad, valor_estimado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        let count = 0;
        const totalObjetos = usuarios.length * 2; // 2 objetos por usuario
        
        usuarios.forEach(user => {
            for (let i = 0; i < 2; i++) {
                const categoriaKey = randomElement(Object.keys(tiposObjeto));
                const categoria = tiposObjeto[categoriaKey];
                const objeto = randomElement(categoria);
                const marca = randomElement(objeto.marcas);
                const modelo = randomElement(objeto.modelos);
                const estado = randomElement(['Excelente', 'Bueno', 'Regular', 'Como nuevo']);
                const antiguedad = randomInt(0, 5);
                const valorEstimado = randomInt(500, 50000);
                const descripcion = `${objeto.tipo} ${marca} ${modelo} en estado ${estado.toLowerCase()}`;
                
                stmt.run([objeto.tipo, marca, modelo, descripcion, estado, antiguedad, valorEstimado], (err) => {
                    if (err) console.error('Error:', err);
                    count++;
                    if (count === totalObjetos) {
                        stmt.finalize();
                        console.log(`✅ ${count} objetos creados\n`);
                        resolve();
                    }
                });
            }
        });
    });
}

async function crearPrecotizacionesYCitas(usuarios) {
    console.log('💰 Creando precotizaciones y citas...');
    
    return new Promise((resolve) => {
        db.all("SELECT id_objeto FROM objetos", (err, objetos) => {
            if (err || !objetos || objetos.length === 0) {
                console.log('No hay objetos');
                resolve();
                return;
            }
            
            const stmtPreco = db.prepare(`
                INSERT INTO precotizaciones (id_objeto, id_usuario, resultado_valor, confiabilidad, estado)
                VALUES (?, ?, ?, ?, ?)
            `);
            
            const stmtCita = db.prepare(`
                INSERT INTO citas (id_usuario, id_precotizacion, fecha, hora, estado, notas)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            let count = 0;
            
            objetos.forEach((obj, index) => {
                const userId = usuarios[index % usuarios.length].id_usuario;
                const valorEstimado = randomInt(500, 50000);
                const confiabilidad = (randomInt(70, 99) / 100).toFixed(2);
                const estadoPreco = randomElement(['pendiente', 'aceptado', 'rechazado']);
                
                stmtPreco.run([obj.id_objeto, userId, valorEstimado, confiabilidad, estadoPreco], function(err) {
                    if (err) {
                        console.error('Error:', err);
                        count++;
                        return;
                    }
                    
                    const idPrecotizacion = this.lastID;
                    
                    // 60% de las precotizaciones generan citas
                    if (Math.random() < 0.6) {
                        const fecha = formatDate(randomDate(new Date(2024, 8, 1), new Date(2025, 11, 31)));
                        const hora = `${randomInt(9, 17)}:${randomElement(['00', '30'])}`;
                        const estadoCita = randomElement(['pendiente', 'confirmada', 'cancelada', 'completada']);
                        const notas = `Cita para evaluar ${obj.id_objeto}`;
                        
                        stmtCita.run([userId, idPrecotizacion, fecha, hora, estadoCita, notas], (err) => {
                            if (err) console.error('Error cita:', err);
                            count++;
                            if (count === objetos.length) {
                                stmtPreco.finalize();
                                stmtCita.finalize();
                                console.log(`✅ Precotizaciones y citas creadas\n`);
                                resolve();
                            }
                        });
                    } else {
                        count++;
                        if (count === objetos.length) {
                            stmtPreco.finalize();
                            stmtCita.finalize();
                            console.log(`✅ Precotizaciones y citas creadas\n`);
                            resolve();
                        }
                    }
                });
            });
        });
    });
}

async function crearEmpenos() {
    console.log('💎 Creando empeños...');
    
    return new Promise((resolve) => {
        db.all(`
            SELECT c.id_usuario, c.id_precotizacion, p.id_objeto, p.resultado_valor
            FROM citas c
            JOIN precotizaciones p ON c.id_precotizacion = p.id_analisis
            WHERE c.estado IN ('confirmada', 'completada')
        `, (err, citas) => {
            if (err || !citas || citas.length === 0) {
                console.log('No hay citas confirmadas');
                resolve();
                return;
            }
            
            const stmt = db.prepare(`
                INSERT INTO empenos (id_usuario, id_objeto, monto_prestado, interes, fecha_inicio, fecha_vencimiento, estado, renovaciones, codigo_qr)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            let count = 0;
            
            citas.forEach((cita, index) => {
                const montoPrestado = Math.floor(cita.resultado_valor * 0.7);
                const interes = randomInt(3, 7);
                const fechaInicio = randomDate(new Date(2024, 8, 1), new Date());
                const fechaVencimiento = new Date(fechaInicio);
                fechaVencimiento.setDate(fechaVencimiento.getDate() + randomElement([30, 60, 90]));
                // Distribuir estados: 60% activo, 20% finalizado, 10% recuperado, 10% vencido
                const estadoOptions = ['activo', 'activo', 'activo', 'finalizado', 'recuperado', 'vencido'];
                const estado = randomElement(estadoOptions);
                const renovaciones = estado === 'activo' ? randomInt(0, 2) : randomInt(0, 1);
                const codigoQr = `EMP-${String(index + 1).padStart(6, '0')}`;
                
                stmt.run([
                    cita.id_usuario,
                    cita.id_objeto,
                    montoPrestado,
                    interes,
                    formatDate(fechaInicio),
                    formatDate(fechaVencimiento),
                    estado,
                    renovaciones,
                    codigoQr
                ], (err) => {
                    if (err) console.error('Error:', err);
                    count++;
                    if (count === citas.length) {
                        stmt.finalize();
                        console.log(`✅ ${count} empeños creados\n`);
                        resolve();
                    }
                });
            });
        });
    });
}

async function crearPagos() {
    console.log('💳 Creando pagos...');
    
    return new Promise((resolve) => {
        db.all("SELECT id_empeno, monto_prestado, interes, estado FROM empenos", (err, empenos) => {
            if (err || !empenos || empenos.length === 0) {
                console.log('No hay empeños');
                resolve();
                return;
            }
            
            const stmt = db.prepare(`
                INSERT INTO pagos (id_empeno, tipo_pago, monto, metodo_pago)
                VALUES (?, ?, ?, ?)
            `);
            
            let count = 0;
            let totalPagos = 0;
            
            empenos.forEach(emp => {
                const numPagos = emp.estado === 'pagado' ? randomInt(2, 4) : (emp.estado === 'activo' ? randomInt(1, 3) : 0);
                totalPagos += numPagos;
                
                for (let i = 0; i < numPagos; i++) {
                    const montoInteres = (emp.monto_prestado * emp.interes) / 100;
                    const tipoPago = i === numPagos - 1 && emp.estado === 'pagado' ? 'total' : 'interes';
                    const monto = tipoPago === 'total' ? emp.monto_prestado + montoInteres : montoInteres;
                    const metodoPago = randomElement(['efectivo', 'tarjeta', 'transferencia']);
                    
                    stmt.run([emp.id_empeno, tipoPago, monto, metodoPago], (err) => {
                        if (err) console.error('Error:', err);
                        count++;
                        if (count === totalPagos) {
                            stmt.finalize();
                            console.log(`✅ ${count} pagos creados\n`);
                            resolve();
                        }
                    });
                }
            });
            
            if (totalPagos === 0) {
                stmt.finalize();
                console.log('✅ 0 pagos (sin empeños elegibles)\n');
                resolve();
            }
        });
    });
}

async function crearNotificaciones(usuarios) {
    console.log('🔔 Creando notificaciones...');
    
    const mensajes = [
        { tipo: 'cita_pendiente', mensaje: 'Nueva cita pendiente de confirmación' },
        { tipo: 'cita_confirmada', mensaje: 'Tu cita ha sido confirmada para mañana' },
        { tipo: 'empeno_creado', mensaje: 'Nuevo empeño creado exitosamente' },
        { tipo: 'pago_vencido', mensaje: 'Tienes un pago vencido' },
        { tipo: 'pago_proximo', mensaje: 'Tu pago de intereses vence en 3 días' },
        { tipo: 'empeno_vencido', mensaje: 'Tu empeño ha vencido' },
        { tipo: 'pago_realizado', mensaje: 'Pago recibido correctamente' }
    ];

    
    return new Promise((resolve) => {
        const stmt = db.prepare(`
            INSERT INTO notificaciones (id_usuario, tipo, mensaje, leida)
            VALUES (?, ?, ?, ?)
        `);
        
        let count = 0;
        const totalNotif = usuarios.length * 2;
        
        usuarios.forEach(user => {
            for (let i = 0; i < 2; i++) {
                const msg = randomElement(mensajes);
                const leida = Math.random() < 0.3 ? 1 : 0;
                
                stmt.run([user.id_usuario, msg.tipo, msg.mensaje, leida], (err) => {
                    if (err) console.error('Error:', err);
                    count++;
                    if (count === totalNotif) {
                        stmt.finalize();
                        console.log(`✅ ${count} notificaciones creadas\n`);
                        resolve();
                    }
                });
            }
        });
    });
}

async function main() {
    console.log('🚀 Iniciando carga de 40 usuarios y datos completos...\n');
    
    try {
        await limpiarDatos();
        await crearUsuarios();
        
        const usuarios = await obtenerUsuarios();
        console.log(`📊 ${usuarios.length} usuarios obtenidos\n`);
        
        await crearObjetos(usuarios);
        await crearPrecotizacionesYCitas(usuarios);
        await crearEmpenos();
        await crearPagos();
        await crearNotificaciones(usuarios);
        
        console.log('\n✅ ¡Base de datos poblada exitosamente!');
        console.log('\n📈 Resumen:');
        console.log('   - 40 usuarios creados');
        console.log('   - ~80 objetos');
        console.log('   - ~80 precotizaciones');
        console.log('   - ~48 citas');
        console.log('   - ~48 empeños');
        console.log('   - Pagos y notificaciones generados');
        console.log('\n🌐 Accede en http://localhost:3000');
        console.log('   Usuarios: <email_generado> / password123');
        console.log('   Admin: admin@empenio.com / admin123\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

main();
