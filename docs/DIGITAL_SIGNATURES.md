# ✍️ Digital Signatures - Sistema de Firmas Digitales

## Objetivo
Implementar firmas digitales para contratos de empeño, garantizando validez legal y trazabilidad completa.

## Casos de Uso

1. **Firma de Contrato al Crear Empeño**
   - Usuario firma digitalmente el contrato
   - Admin firma como testigo/autorización
   - Contrato se almacena con firmas

2. **Firma de Renovación**
   - Usuario firma extensión de plazo
   - Se genera addendum al contrato original

3. **Firma de Liquidación**
   - Usuario firma recibo de pago total
   - Confirma retiro del objeto

4. **Verificación de Autenticidad**
   - Validar firmas en cualquier momento
   - Detección de alteraciones
   - Trazabilidad completa

## Tecnologías

### Opción 1: SignaturePad + Canvas (Firma Manual)
**Pros:**
- Gratis
- Fácil implementación
- No requiere servicios externos
- Compatible con móviles

**Contras:**
- No tiene validez legal automática
- Requiere certificación adicional
- Sin timestamping automático

### Opción 2: DocuSign API (Enterprise)
**Pros:**
- Validez legal garantizada
- Cumple con eIDAS/ESIGN
- Audit trail completo
- Timestamping oficial

**Contras:**
- Costo elevado ($25-40/mes por usuario)
- Complejidad de integración
- Requiere cuenta business

### Opción 3: Adobe Sign API
**Pros:**
- Validez legal
- Integración con PDF
- Reconocimiento mundial

**Contras:**
- Costoso
- Complejo

### Opción 4: Blockchain + IPFS (Descentralizado)
**Pros:**
- Inmutable
- Transparente
- Sin costos recurrentes
- Innovador

**Contras:**
- Requiere wallet
- Curva de aprendizaje
- Gas fees (Ethereum)

## Implementación Recomendada: SignaturePad + PDF + Blockchain

### 1. Frontend - Componente de Firma

```javascript
// client/src/components/FirmaDigital.js
import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import './FirmaDigital.css';

const FirmaDigital = ({ onFirmaCompleta, titulo = 'Firma aquí' }) => {
  const sigPad = useRef(null);
  const [firmada, setFirmada] = useState(false);

  const limpiar = () => {
    sigPad.current.clear();
    setFirmada(false);
  };

  const guardar = () => {
    if (sigPad.current.isEmpty()) {
      alert('Por favor firma antes de continuar');
      return;
    }

    const dataURL = sigPad.current.toDataURL('image/png');
    setFirmada(true);
    onFirmaCompleta(dataURL);
  };

  return (
    <div className="firma-digital-container">
      <h3>{titulo}</h3>
      <div className="firma-canvas-wrapper">
        <SignaturePad
          ref={sigPad}
          canvasProps={{
            className: 'firma-canvas',
            width: 500,
            height: 200
          }}
        />
      </div>
      <div className="firma-actions">
        <button onClick={limpiar} className="btn btn-secondary">
          🗑️ Limpiar
        </button>
        <button onClick={guardar} className="btn btn-primary">
          ✓ Confirmar Firma
        </button>
      </div>
      {firmada && (
        <div className="firma-success">
          ✅ Firma capturada exitosamente
        </div>
      )}
    </div>
  );
};

export default FirmaDigital;
```

```css
/* client/src/components/FirmaDigital.css */
.firma-digital-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.firma-digital-container h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.firma-canvas-wrapper {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 10px;
  background: #fafafa;
  margin-bottom: 15px;
}

.firma-canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: crosshair;
  touch-action: none;
}

.firma-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.firma-success {
  margin-top: 15px;
  padding: 10px;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}
```

### 2. Modal de Contrato con Firma

```javascript
// client/src/components/ContratoModal.js
import React, { useState } from 'react';
import FirmaDigital from './FirmaDigital';
import api from '../services/api';

const ContratoModal = ({ empeno, onClose, onFirmado }) => {
  const [firmaUsuario, setFirmaUsuario] = useState(null);
  const [firmaAdmin, setFirmaAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const firmarContrato = async () => {
    if (!firmaUsuario || !firmaAdmin) {
      alert('Faltan firmas por completar');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/workflow/firmar-contrato', {
        id_empeno: empeno.id_empeno,
        firma_usuario: firmaUsuario,
        firma_admin: firmaAdmin,
        timestamp: new Date().toISOString()
      });

      alert('✅ Contrato firmado exitosamente');
      onFirmado(res.data);
      onClose();
    } catch (error) {
      alert('❌ Error al firmar contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="contrato-modal">
        <div className="modal-header">
          <h2>📄 Contrato de Empeño #{empeno.id_empeno}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="modal-body">
          {/* Contrato en texto */}
          <div className="contrato-texto">
            <h3>CONTRATO DE MUTUO CON GARANTÍA PRENDARIA</h3>
            <p><strong>Entre:</strong></p>
            <ul>
              <li><strong>ACREEDOR:</strong> Casa de Empeño (Admin)</li>
              <li><strong>DEUDOR:</strong> {empeno.usuario_nombre}</li>
            </ul>

            <p><strong>Objeto en Garantía:</strong></p>
            <ul>
              <li>Tipo: {empeno.tipo}</li>
              <li>Marca: {empeno.marca}</li>
              <li>Modelo: {empeno.modelo}</li>
            </ul>

            <p><strong>Condiciones Financieras:</strong></p>
            <ul>
              <li>Monto Prestado: ${empeno.monto_prestado.toLocaleString()}</li>
              <li>Interés: ${empeno.interes.toLocaleString()}</li>
              <li>Total a Pagar: ${(empeno.monto_prestado + empeno.interes).toLocaleString()}</li>
              <li>Fecha de Inicio: {empeno.fecha_inicio}</li>
              <li>Fecha de Vencimiento: {empeno.fecha_vencimiento}</li>
            </ul>

            <p><strong>Cláusulas:</strong></p>
            <ol>
              <li>El DEUDOR entrega en garantía el objeto descrito.</li>
              <li>El DEUDOR se compromete a pagar el monto total antes del vencimiento.</li>
              <li>En caso de incumplimiento, el ACREEDOR podrá disponer del objeto.</li>
              <li>El DEUDOR puede renovar el empeño pagando los intereses.</li>
            </ol>

            <p className="fecha-contrato">
              Fecha: {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Sección de Firmas */}
          <div className="firmas-seccion">
            <div className="firma-usuario">
              <FirmaDigital
                titulo="Firma del Cliente (Deudor)"
                onFirmaCompleta={setFirmaUsuario}
              />
            </div>

            <div className="firma-admin">
              <FirmaDigital
                titulo="Firma del Administrador (Acreedor)"
                onFirmaCompleta={setFirmaAdmin}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button 
            onClick={firmarContrato} 
            className="btn btn-primary"
            disabled={!firmaUsuario || !firmaAdmin || loading}
          >
            {loading ? '⏳ Procesando...' : '✓ Firmar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContratoModal;
```

### 3. Backend - API de Firmas

```javascript
// server/routes/workflow.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Firmar contrato digitalmente
router.post('/firmar-contrato', authMiddleware, async (req, res) => {
  const { id_empeno, firma_usuario, firma_admin, timestamp } = req.body;

  try {
    // 1. Obtener datos del empeño
    const empeno = await new Promise((resolve, reject) => {
      db.get(`
        SELECT e.*, u.nombre as usuario_nombre, u.dni, o.tipo, o.marca, o.modelo
        FROM empenos e
        JOIN usuarios u ON e.id_usuario = u.id_usuario
        JOIN objetos o ON e.id_objeto = o.id_objeto
        WHERE e.id_empeno = ?
      `, [id_empeno], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!empeno) {
      return res.status(404).json({ error: 'Empeño no encontrado' });
    }

    // 2. Generar hash del contrato
    const contratoData = {
      id_empeno,
      usuario: empeno.usuario_nombre,
      dni: empeno.dni,
      objeto: `${empeno.tipo} ${empeno.marca} ${empeno.modelo}`,
      monto_prestado: empeno.monto_prestado,
      interes: empeno.interes,
      fecha_inicio: empeno.fecha_inicio,
      fecha_vencimiento: empeno.fecha_vencimiento,
      timestamp
    };

    const contratoHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(contratoData))
      .digest('hex');

    // 3. Guardar firmas como imágenes
    const firmasDir = path.join(__dirname, '..', 'uploads', 'firmas');
    if (!fs.existsSync(firmasDir)) {
      fs.mkdirSync(firmasDir, { recursive: true });
    }

    const firmaUsuarioPath = path.join(firmasDir, `${id_empeno}_usuario.png`);
    const firmaAdminPath = path.join(firmasDir, `${id_empeno}_admin.png`);

    // Convertir base64 a archivo
    const base64ToFile = (base64Data, filePath) => {
      const base64Image = base64Data.split(';base64,').pop();
      fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
    };

    base64ToFile(firma_usuario, firmaUsuarioPath);
    base64ToFile(firma_admin, firmaAdminPath);

    // 4. Guardar en base de datos
    db.run(`
      INSERT INTO contratos_firmados (
        id_empeno,
        contrato_hash,
        firma_usuario_path,
        firma_admin_path,
        timestamp,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id_empeno,
      contratoHash,
      firmaUsuarioPath,
      firmaAdminPath,
      timestamp,
      req.ip
    ], function(err) {
      if (err) {
        console.error('Error guardando contrato:', err);
        return res.status(500).json({ error: 'Error al guardar contrato' });
      }

      // 5. Actualizar empeño
      db.run(`
        UPDATE empenos 
        SET contrato_firmado = 1, contrato_hash = ?
        WHERE id_empeno = ?
      `, [contratoHash, id_empeno]);

      res.json({
        success: true,
        contrato_id: this.lastID,
        contrato_hash: contratoHash,
        timestamp,
        mensaje: 'Contrato firmado exitosamente'
      });
    });

  } catch (error) {
    console.error('Error en firma de contrato:', error);
    res.status(500).json({ error: 'Error al procesar firma' });
  }
});

// Verificar autenticidad de contrato
router.get('/verificar-contrato/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT cf.*, e.monto_prestado, e.interes, u.nombre, u.dni
    FROM contratos_firmados cf
    JOIN empenos e ON cf.id_empeno = e.id_empeno
    JOIN usuarios u ON e.id_usuario = u.id_usuario
    WHERE cf.id_empeno = ?
  `, [id], (err, contrato) => {
    if (err || !contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    // Verificar integridad del hash
    const contratoActual = {
      id_empeno: contrato.id_empeno,
      usuario: contrato.nombre,
      dni: contrato.dni,
      monto_prestado: contrato.monto_prestado,
      interes: contrato.interes,
      timestamp: contrato.timestamp
    };

    const hashActual = crypto
      .createHash('sha256')
      .update(JSON.stringify(contratoActual))
      .digest('hex');

    const integro = hashActual === contrato.contrato_hash;

    res.json({
      contrato,
      verificacion: {
        integro,
        hash_original: contrato.contrato_hash,
        hash_actual: hashActual,
        mensaje: integro ? 
          '✅ Contrato íntegro y sin alteraciones' : 
          '⚠️ El contrato ha sido alterado'
      }
    });
  });
});
```

### 4. Base de Datos - Nueva Tabla

```javascript
// En server/config/database.js

db.run(`
  CREATE TABLE IF NOT EXISTS contratos_firmados (
    id_contrato INTEGER PRIMARY KEY AUTOINCREMENT,
    id_empeno INTEGER NOT NULL,
    contrato_hash TEXT NOT NULL,
    firma_usuario_path TEXT NOT NULL,
    firma_admin_path TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip_address TEXT,
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empeno) REFERENCES empenos(id_empeno)
  )
`);

// Agregar columnas a empenos
db.run(`ALTER TABLE empenos ADD COLUMN contrato_firmado INTEGER DEFAULT 0`);
db.run(`ALTER TABLE empenos ADD COLUMN contrato_hash TEXT`);
```

### 5. Instalación de Dependencias

```bash
npm install react-signature-canvas
```

## Blockchain Integration (Opcional pero Revolucionario)

### Usando Ethereum + IPFS

```javascript
// server/services/blockchain.js
const { Web3 } = require('web3');
const IPFS = require('ipfs-http-client');

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.ETHEREUM_RPC);
    this.ipfs = IPFS.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY;
  }

  async guardarContratoIPFS(contrato) {
    const { cid } = await this.ipfs.add(JSON.stringify(contrato));
    return cid.toString();
  }

  async registrarEnBlockchain(contratoHash, ipfsCID) {
    const account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    
    const tx = {
      from: account.address,
      to: this.contractAddress,
      data: this.web3.eth.abi.encodeFunctionCall({
        name: 'registrarContrato',
        type: 'function',
        inputs: [{
          type: 'string',
          name: 'hash'
        }, {
          type: 'string',
          name: 'ipfs'
        }]
      }, [contratoHash, ipfsCID]),
      gas: 200000
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey);
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt.transactionHash;
  }
}

module.exports = new BlockchainService();
```

## Testing

```javascript
// Test de firma digital
describe('Digital Signatures', () => {
  it('debe crear y verificar firma correctamente', async () => {
    const firma = await crearFirma(empeno);
    expect(firma.hash).toBeDefined();
    
    const verificacion = await verificarFirma(firma.hash);
    expect(verificacion.integro).toBe(true);
  });
});
```

## Consideraciones Legales

1. **Validez Legal en México:**
   - Ley de Firma Electrónica Avanzada
   - NOM-151-SCFI-2016
   - Certificado de Sello Digital (CSD)

2. **Requisitos:**
   - Timestamp confiable (NTP)
   - IP del firmante
   - Geolocalización (opcional)
   - Identificación oficial validada

3. **Almacenamiento:**
   - Mínimo 5 años
   - Backup triple
   - Encriptación AES-256

## Flujo Completo

```
Cliente presenta objeto
    ↓
Valuación IA
    ↓
Crea Empeño
    ↓
Se genera Contrato
    ↓
Modal de Firma aparece
    ↓
Cliente firma (SignaturePad)
    ↓
Admin firma (SignaturePad)
    ↓
Sistema genera Hash SHA-256
    ↓
Guarda firmas como PNG
    ↓
[Opcional] Sube a IPFS
    ↓
[Opcional] Registra en Blockchain
    ↓
Envía contrato por WhatsApp/Email
    ↓
QR code con link de verificación
    ↓
✅ Contrato firmado y archivado
```

## Próximos Pasos

1. ✅ Instalar react-signature-canvas
2. ✅ Crear componente FirmaDigital
3. ✅ Crear ContratoModal
4. ✅ Implementar API de firmas
5. ✅ Crear tabla contratos_firmados
6. ✅ Testing exhaustivo
7. ✅ [Opcional] Implementar IPFS
8. ✅ [Opcional] Implementar Blockchain
9. ✅ Consultoría legal para validez
10. ✅ Deploy a producción
