# 📱 WhatsApp Integration - Sistema de Empeños

## Objetivo
Enviar notificaciones automáticas vía WhatsApp a usuarios y administradores para mejorar la comunicación y experiencia.

## Casos de Uso

### Para Usuarios:
1. **Confirmación de Cotización**
   - "¡Hola! Tu objeto ha sido valorado en $X,XXX. Agenda tu cita aquí: [link]"
   
2. **Cita Confirmada**
   - "Tu cita ha sido confirmada para el DD/MM/YYYY a las HH:MM. Te esperamos!"
   
3. **Empeño Creado**
   - "¡Empeño creado! ID: #XXX. Monto: $X,XXX. Vencimiento: DD/MM/YYYY. Código QR: [imagen]"
   
4. **Recordatorio de Pago (7 días antes)**
   - "⏰ Tu empeño vence en 7 días. Monto a pagar: $X,XXX. ¿Deseas renovar?"
   
5. **Recordatorio de Pago (2 días antes)**
   - "🚨 URGENTE: Tu empeño vence en 2 días. Por favor realiza el pago para evitar pérdida del objeto."
   
6. **Pago Confirmado**
   - "✅ Pago recibido! Tu empeño ha sido renovado hasta DD/MM/YYYY"
   
7. **Objeto Listo para Retirar**
   - "🎉 Tu pago se completó! Puedes retirar tu objeto. Trae tu código QR."

### Para Administrador:
1. **Nueva Cotización**
   - "📋 Nueva cotización recibida de [Usuario]. Tipo: [Objeto]"
   
2. **Cita Agendada**
   - "📅 Nueva cita agendada: [Usuario] - [Fecha] [Hora]"
   
3. **Empeño por Vencer**
   - "⏰ 5 empeños vencen esta semana"
   
4. **Empeño Vencido**
   - "⚠️ Empeño #XXX de [Usuario] ha vencido"

## Implementación Técnica

### Opción 1: Twilio WhatsApp API (Recomendada)
**Pros:**
- API oficial y confiable
- Fácil integración con Node.js
- Plantillas pre-aprobadas
- Soporte para multimedia (imágenes QR)

**Contras:**
- Requiere cuenta Business verificada
- Costo por mensaje (~$0.005 USD)

**Código de ejemplo:**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

async function enviarNotificacionWhatsApp(telefono, mensaje, imagenQR) {
  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Número de Twilio
      to: `whatsapp:+52${telefono}`,
      body: mensaje,
      mediaUrl: imagenQR ? [imagenQR] : undefined
    });
    console.log('✅ WhatsApp enviado');
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
  }
}
```

### Opción 2: WhatsApp Business API
**Pros:**
- Sin costo por mensaje
- Control total
- Marca propia

**Contras:**
- Proceso de aprobación largo (Facebook)
- Configuración compleja
- Requiere servidor dedicado

### Opción 3: Baileys (WhatsApp Web)
**Pros:**
- Gratis
- Rápida implementación
- No requiere aprobación

**Contras:**
- Contra términos de servicio de WhatsApp
- Riesgo de baneo
- Requiere QR de autenticación

## Estructura de Código

### 1. Servicio de WhatsApp
```javascript
// server/services/whatsapp.js
const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.from = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  async enviarCotizacionRecibida(usuario, valor) {
    const mensaje = `¡Hola ${usuario.nombre}! 🎉

Tu objeto ha sido valorado en $${valor.toLocaleString()}.

Agenda tu cita aquí: ${process.env.FRONTEND_URL}/dashboard

¡Gracias por confiar en nosotros!`;

    return this.enviar(usuario.contacto, mensaje);
  }

  async enviarCitaConfirmada(usuario, cita) {
    const mensaje = `✅ Cita Confirmada

Hola ${usuario.nombre},

Tu cita ha sido confirmada:
📅 Fecha: ${cita.fecha}
⏰ Hora: ${cita.hora}
📍 Dirección: [Tu dirección]

¡Te esperamos!`;

    return this.enviar(usuario.contacto, mensaje);
  }

  async enviarEmpenoCreado(usuario, empeno, qrUrl) {
    const mensaje = `💼 Empeño Creado

ID: #${empeno.id_empeno}
Monto: $${empeno.monto_prestado.toLocaleString()}
Vencimiento: ${empeno.fecha_vencimiento}

Guarda tu código QR para retirar tu objeto.`;

    return this.enviar(usuario.contacto, mensaje, qrUrl);
  }

  async enviarRecordatorioPago(usuario, empeno, diasRestantes) {
    const urgente = diasRestantes <= 2 ? '🚨 URGENTE: ' : '⏰ ';
    const mensaje = `${urgente}Recordatorio de Pago

Hola ${usuario.nombre},

Tu empeño vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.

Monto a pagar: $${(empeno.monto_prestado + empeno.interes).toLocaleString()}

${diasRestantes <= 2 ? '⚠️ Evita perder tu objeto, paga hoy!' : '¿Deseas renovar tu empeño?'}

Paga aquí: ${process.env.FRONTEND_URL}/dashboard`;

    return this.enviar(usuario.contacto, mensaje);
  }

  async enviarPagoConfirmado(usuario, empeno) {
    const mensaje = `✅ Pago Confirmado

¡Gracias por tu pago!

Tu empeño ha sido renovado hasta: ${empeno.fecha_vencimiento}

ID: #${empeno.id_empeno}`;

    return this.enviar(usuario.contacto, mensaje);
  }

  async enviarObjetoListo(usuario, empeno, qrUrl) {
    const mensaje = `🎉 ¡Tu objeto está listo!

Hola ${usuario.nombre},

Tu pago se ha completado exitosamente.

Puedes retirar tu objeto presentando:
✓ Tu código QR
✓ Identificación oficial

Horario: Lun-Vie 9:00-18:00

¡Gracias por tu preferencia!`;

    return this.enviar(usuario.contacto, mensaje, qrUrl);
  }

  // Método privado para enviar
  async enviar(telefono, mensaje, mediaUrl) {
    try {
      const result = await this.client.messages.create({
        from: this.from,
        to: `whatsapp:+52${telefono}`,
        body: mensaje,
        mediaUrl: mediaUrl ? [mediaUrl] : undefined
      });

      console.log(`✅ WhatsApp enviado a ${telefono}: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error(`❌ Error enviando WhatsApp a ${telefono}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Para admin
  async notificarAdmin(mensaje) {
    const adminPhone = process.env.ADMIN_WHATSAPP;
    return this.enviar(adminPhone, mensaje);
  }
}

module.exports = new WhatsAppService();
```

### 2. Integración en Workflows
```javascript
// En server/routes/workflow.js

const whatsappService = require('../services/whatsapp');

// Después de crear empeño
router.post('/crear-desde-cita', authMiddleware, isAdmin, async (req, res) => {
  // ... código existente ...
  
  // Enviar WhatsApp
  await whatsappService.enviarEmpenoCreado(usuario, empeno, qrUrl);
  
  // ...
});

// Después de confirmar cita
router.put('/confirmar-cita/:id', authMiddleware, isAdmin, async (req, res) => {
  // ... código existente ...
  
  await whatsappService.enviarCitaConfirmada(usuario, cita);
  
  // ...
});
```

### 3. Job Programado para Recordatorios
```javascript
// server/jobs/recordatorios.js
const cron = require('node-cron');
const whatsappService = require('../services/whatsapp');
const { db } = require('../config/database');

// Ejecutar diariamente a las 10:00 AM
cron.schedule('0 10 * * *', () => {
  console.log('📅 Ejecutando job de recordatorios...');
  
  // Empeños que vencen en 7 días
  db.all(`
    SELECT e.*, u.nombre, u.contacto
    FROM empenos e
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE e.estado = 'activo'
    AND date(e.fecha_vencimiento) = date('now', '+7 days')
  `, [], async (err, empenos) => {
    if (!err) {
      for (const empeno of empenos) {
        await whatsappService.enviarRecordatorioPago(empeno, empeno, 7);
      }
    }
  });
  
  // Empeños que vencen en 2 días (urgente)
  db.all(`
    SELECT e.*, u.nombre, u.contacto
    FROM empenos e
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE e.estado = 'activo'
    AND date(e.fecha_vencimiento) = date('now', '+2 days')
  `, [], async (err, empenos) => {
    if (!err) {
      for (const empeno of empenos) {
        await whatsappService.enviarRecordatorioPago(empeno, empeno, 2);
      }
    }
  });
});

module.exports = { startJobs: () => console.log('✅ Jobs de WhatsApp iniciados') };
```

### 4. Variables de Entorno
```env
# .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP=5551234567
FRONTEND_URL=http://localhost:3000
```

### 5. Instalación
```bash
npm install twilio node-cron
```

## Configuración de Twilio

1. **Crear cuenta** en https://www.twilio.com
2. **Activar WhatsApp Sandbox** en Console → Messaging → Try WhatsApp
3. **Obtener credenciales**:
   - Account SID
   - Auth Token
   - WhatsApp Number
4. **Enviar mensaje de prueba** al número de sandbox
5. **Para producción**: Solicitar número propio y plantillas aprobadas

## Testing

```javascript
// Test manual
const whatsappService = require('./services/whatsapp');

whatsappService.enviar('5551234567', '¡Hola! Este es un mensaje de prueba.')
  .then(result => console.log('Resultado:', result));
```

## Métricas y Monitoreo

- Tasa de entrega de mensajes
- Tasa de respuesta
- Tiempo de respuesta promedio
- Mensajes por tipo
- Costos mensuales

## Próximos Pasos

1. ✅ Crear cuenta Twilio
2. ✅ Configurar WhatsApp Sandbox
3. ✅ Implementar WhatsAppService
4. ✅ Integrar en workflows existentes
5. ✅ Configurar jobs programados
6. ✅ Testing exhaustivo
7. ✅ Solicitar aprobación de plantillas
8. ✅ Deploy a producción

## Alternativa: Notificaciones por SMS

Si WhatsApp no es viable, se puede usar SMS de Twilio con código similar:

```javascript
await client.messages.create({
  from: '+15551234567',
  to: `+52${telefono}`,
  body: mensaje
});
```

**Costo:** ~$0.0075 USD por SMS
