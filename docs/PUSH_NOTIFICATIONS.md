# 🔔 Push Notifications - Notificaciones del Navegador

## Objetivo
Implementar notificaciones push del navegador para mantener a usuarios y admins informados en tiempo real, incluso cuando la webapp no esté abierta.

## Casos de Uso

### Para Usuarios:
- 🔔 "Tu cotización ha sido procesada - $2,500"
- 📅 "Tu cita ha sido confirmada para mañana 10:00 AM"
- 💼 "Tu empeño #123 ha sido creado"
- ⏰ "Recordatorio: Tu pago vence en 2 días"
- ✅ "Pago confirmado - Gracias por tu preferencia"
- 🎉 "Tu objeto está listo para retirar"

### Para Admin:
- 📋 "Nueva cotización recibida"
- 📅 "Nueva cita agendada - Juan Pérez"
- ⚠️ "5 empeños vencen esta semana"
- 💰 "Pago recibido - Empeño #456"

## Tecnología: Web Push API + Service Workers

### Ventajas:
- ✅ Gratis (sin costos de servidor)
- ✅ Funciona offline
- ✅ Compatible con Chrome, Firefox, Edge, Safari (iOS 16.4+)
- ✅ No requiere app nativa
- ✅ Llega aunque el navegador esté cerrado
- ✅ Soporta acciones (botones)
- ✅ Imágenes, íconos, badges

## Arquitectura

```
Frontend (React)
    ↓
Service Worker (PWA)
    ↓
Push API del Navegador
    ↓
Sistema de Notificaciones del SO
```

## Implementación

### 1. Service Worker

```javascript
// client/public/service-worker.js
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado');
  event.waitUntil(clients.claim());
});

// Escuchar notificaciones push
self.addEventListener('push', (event) => {
  console.log('📩 Push recibido:', event);
  
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.mensaje || 'Nueva notificación',
    icon: '/logo192.png',
    badge: '/badge-icon.png',
    image: data.imagen,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      id: data.id
    },
    actions: [
      {
        action: 'view',
        title: 'Ver detalles',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/close.png'
      }
    ],
    tag: data.tag || 'general',
    renotify: true,
    requireInteraction: data.urgente || false
  };

  event.waitUntil(
    self.registration.showNotification(data.titulo || 'Empeño', options)
  );
});

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // Abrir o enfocar la app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const url = event.notification.data.url;
          
          // Si ya está abierta, enfocala
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Si no, abre nueva ventana
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});
```

### 2. React Hook para Push Notifications

```javascript
// client/src/hooks/usePushNotifications.js
import { useState, useEffect } from 'react';
import api from '../services/api';

const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Verificar soporte
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error verificando suscripción:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return true;
      } else {
        alert('❌ Necesitas habilitar las notificaciones para recibir alertas');
        return false;
      }
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      return false;
    }
  };

  const subscribe = async () => {
    try {
      // 1. Verificar permiso
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // 2. Registrar service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // 3. Obtener VAPID public key del servidor
      const { data: { publicKey } } = await api.get('/push/vapid-key');

      // 4. Crear suscripción
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // 5. Enviar suscripción al servidor
      await api.post('/push/subscribe', {
        subscription: sub.toJSON()
      });

      setSubscription(sub);
      setIsSubscribed(true);
      
      console.log('✅ Suscrito a push notifications');
      return true;
    } catch (error) {
      console.error('❌ Error suscribiéndose:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notificar al servidor
        await api.post('/push/unsubscribe', {
          endpoint: subscription.endpoint
        });

        setSubscription(null);
        setIsSubscribed(false);
        
        console.log('✅ Desuscrito de push notifications');
      }
    } catch (error) {
      console.error('❌ Error desuscribiéndose:', error);
    }
  };

  const testNotification = async () => {
    try {
      await api.post('/push/test');
      console.log('📧 Notificación de prueba enviada');
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    testNotification
  };
};

// Utilidad para convertir VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
```

### 3. Componente de Configuración

```javascript
// client/src/components/NotificationSettings.js
import React from 'react';
import usePushNotifications from '../hooks/usePushNotifications';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    testNotification
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <div className="not-supported">
          ⚠️ Tu navegador no soporta notificaciones push
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="setting-header">
        <h3>🔔 Notificaciones Push</h3>
        <p>Recibe alertas en tiempo real aunque la app esté cerrada</p>
      </div>

      <div className="setting-content">
        <div className="setting-item">
          <div className="setting-info">
            <strong>Estado</strong>
            <span className={isSubscribed ? 'status-active' : 'status-inactive'}>
              {isSubscribed ? '✅ Activadas' : '❌ Desactivadas'}
            </span>
          </div>
          
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            className={`btn ${isSubscribed ? 'btn-danger' : 'btn-primary'}`}
          >
            {isSubscribed ? 'Desactivar' : 'Activar'}
          </button>
        </div>

        {isSubscribed && (
          <div className="setting-item">
            <div className="setting-info">
              <strong>Prueba</strong>
              <span>Envía una notificación de prueba</span>
            </div>
            
            <button onClick={testNotification} className="btn btn-secondary">
              📧 Probar
            </button>
          </div>
        )}

        <div className="notification-examples">
          <h4>Recibirás notificaciones para:</h4>
          <ul>
            <li>✅ Cotizaciones procesadas</li>
            <li>📅 Citas confirmadas</li>
            <li>💼 Empeños creados</li>
            <li>⏰ Recordatorios de pago</li>
            <li>💰 Pagos confirmados</li>
            <li>🎉 Objetos listos para retirar</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
```

### 4. Backend - API de Push

```javascript
// server/routes/push.js
const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:admin@empenio.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Obtener public key
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Suscribir
router.post('/subscribe', authMiddleware, (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;

  db.run(`
    INSERT OR REPLACE INTO push_subscriptions (id_usuario, endpoint, keys_p256dh, keys_auth)
    VALUES (?, ?, ?, ?)
  `, [
    userId,
    subscription.endpoint,
    subscription.keys.p256dh,
    subscription.keys.auth
  ], (err) => {
    if (err) {
      console.error('Error guardando suscripción:', err);
      return res.status(500).json({ error: 'Error al guardar suscripción' });
    }

    res.json({ success: true, mensaje: 'Suscrito exitosamente' });
  });
});

// Desuscribir
router.post('/unsubscribe', authMiddleware, (req, res) => {
  const { endpoint } = req.body;

  db.run(`
    DELETE FROM push_subscriptions WHERE endpoint = ?
  `, [endpoint], (err) => {
    if (err) {
      console.error('Error eliminando suscripción:', err);
      return res.status(500).json({ error: 'Error al desuscribir' });
    }

    res.json({ success: true, mensaje: 'Desuscrito exitosamente' });
  });
});

// Enviar notificación de prueba
router.post('/test', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const subscriptions = await getSubscriptionsByUser(userId);

    if (subscriptions.length === 0) {
      return res.status(400).json({ error: 'No hay suscripciones activas' });
    }

    const payload = JSON.stringify({
      titulo: '🔔 Notificación de Prueba',
      mensaje: 'Las notificaciones push están funcionando correctamente',
      url: '/dashboard',
      urgente: false
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (error) {
        console.error('Error enviando a suscripción:', error);
      }
    }

    res.json({ success: true, mensaje: 'Notificación de prueba enviada' });
  } catch (error) {
    console.error('Error en test de notificación:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

// Función helper para obtener suscripciones
function getSubscriptionsByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT endpoint, keys_p256dh, keys_auth
      FROM push_subscriptions
      WHERE id_usuario = ?
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else {
        const subscriptions = rows.map(row => ({
          endpoint: row.endpoint,
          keys: {
            p256dh: row.keys_p256dh,
            auth: row.keys_auth
          }
        }));
        resolve(subscriptions);
      }
    });
  });
}

// Enviar notificación a usuario específico
async function enviarNotificacionAUsuario(userId, notificacion) {
  try {
    const subscriptions = await getSubscriptionsByUser(userId);
    
    const payload = JSON.stringify(notificacion);

    const resultados = await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );

    const exitosas = resultados.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ ${exitosas}/${subscriptions.length} notificaciones enviadas a usuario ${userId}`);

    return { exitosas, total: subscriptions.length };
  } catch (error) {
    console.error('Error enviando notificación:', error);
    throw error;
  }
}

// Enviar a múltiples usuarios
async function enviarNotificacionMasiva(userIds, notificacion) {
  const resultados = await Promise.allSettled(
    userIds.map(userId => enviarNotificacionAUsuario(userId, notificacion))
  );

  return resultados;
}

module.exports = {
  router,
  enviarNotificacionAUsuario,
  enviarNotificacionMasiva
};
```

### 5. Base de Datos

```javascript
// En server/config/database.js

db.run(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id_subscription INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    endpoint TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
  )
`);
```

### 6. Generar VAPID Keys

```javascript
// server/generate-vapid.js
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generadas:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('\nAgrega estas a tu .env:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
```

### 7. Integración con Workflows

```javascript
// En server/routes/workflow.js
const { enviarNotificacionAUsuario } = require('./push');

// Después de crear empeño
router.post('/crear-desde-cita', authMiddleware, isAdmin, async (req, res) => {
  // ... código existente ...

  // Enviar push notification
  await enviarNotificacionAUsuario(cita.id_usuario, {
    titulo: '💼 Empeño Creado',
    mensaje: `Tu empeño #${idEmpeno} ha sido creado. Monto: $${monto_prestado.toLocaleString()}`,
    url: '/dashboard',
    imagen: '/images/empeno-created.png',
    urgente: false
  });

  // ...
});

// Recordatorio de pago
cron.schedule('0 10 * * *', async () => {
  db.all(`
    SELECT e.*, u.id_usuario, u.nombre
    FROM empenos e
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE e.estado = 'activo'
    AND date(e.fecha_vencimiento) = date('now', '+2 days')
  `, [], async (err, empenos) => {
    if (!err) {
      for (const empeno of empenos) {
        await enviarNotificacionAUsuario(empeno.id_usuario, {
          titulo: '🚨 Pago Urgente',
          mensaje: `Tu empeño vence en 2 días. Monto: $${(empeno.monto_prestado + empeno.interes).toLocaleString()}`,
          url: '/dashboard',
          urgente: true
        });
      }
    }
  });
});
```

### 8. Instalación

```bash
npm install web-push
node server/generate-vapid.js
```

### 9. Variables de Entorno

```env
VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

## Testing

### Navegadores Soportados:
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16.4+ (iOS y macOS)
- ✅ Opera 37+
- ❌ IE (no soportado)

### Pruebas Recomendadas:
1. Suscribirse desde diferentes dispositivos
2. Enviar notificación con app cerrada
3. Enviar con app en background
4. Click en notificación (debe abrir app)
5. Desuscribirse correctamente

## PWA Manifest

```json
// client/public/manifest.json
{
  "name": "Sistema de Empeños",
  "short_name": "Empeño",
  "description": "Sistema revolucionario de gestión de empeños",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
```

## Próximos Pasos

1. ✅ Generar VAPID keys
2. ✅ Crear service-worker.js
3. ✅ Implementar usePushNotifications hook
4. ✅ Crear NotificationSettings component
5. ✅ Implementar API backend
6. ✅ Crear tabla push_subscriptions
7. ✅ Integrar con workflows
8. ✅ Testing exhaustivo
9. ✅ Configurar PWA manifest
10. ✅ Deploy a producción con HTTPS (requerido)

## Notas Importantes

⚠️ **HTTPS es obligatorio** para Push API (excepto localhost)
⚠️ Safari requiere iOS 16.4+ o macOS 13+
⚠️ Los usuarios deben dar permiso explícito
⚠️ Las notificaciones pueden ser bloqueadas por el SO
