const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Solicitar pre-cotización con IA
router.post('/solicitar', authMiddleware, async (req, res) => {
  const { id_objeto } = req.body;

  try {
    // Obtener datos del objeto
    db.get('SELECT * FROM objetos WHERE id_objeto = ?', [id_objeto], async (err, objeto) => {
      if (err || !objeto) {
        return res.status(404).json({ error: 'Objeto no encontrado' });
      }

      try {
        // Llamar al servicio de IA
        const iaResponse = await axios.post(`${process.env.IA_API_URL}/predict`, {
          tipo_objeto: objeto.tipo,
          marca: objeto.marca || 'Genérica',
          estado: objeto.estado,
          antiguedad: objeto.antiguedad || 1,
          descripcion: objeto.descripcion
        });

        const valorEstimado = iaResponse.data.valor_estimado;
        const confiabilidad = iaResponse.data.confiabilidad;

        // Actualizar valor estimado del objeto
        db.run('UPDATE objetos SET valor_estimado = ? WHERE id_objeto = ?', [valorEstimado, id_objeto]);

        // Guardar pre-cotización
        db.run(
          `INSERT INTO precotizaciones (id_objeto, id_usuario, resultado_valor, confiabilidad, estado)
           VALUES (?, ?, ?, ?, 'completada')`,
          [id_objeto, req.user.id, valorEstimado, confiabilidad],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error al guardar pre-cotización' });
            }

            res.json({
              message: 'Pre-cotización generada exitosamente',
              id_analisis: this.lastID,
              valor_estimado: valorEstimado,
              confiabilidad: confiabilidad,
              monto_prestamo: Math.round(valorEstimado * 0.7), // 70% del valor estimado
              interes_mensual: Math.round(valorEstimado * 0.7 * 0.15) // 15% de interés
            });
          }
        );
      } catch (iaError) {
        console.error('Error en servicio de IA:', iaError.message);
        
        // Fallback: cotización manual básica
        const valorBase = {
          'celular': 100000,
          'notebook': 250000,
          'tablet': 80000,
          'reloj': 50000,
          'televisor': 150000,
          'consola': 120000,
          'joya': 200000
        };

        const valorEstimado = valorBase[objeto.tipo.toLowerCase()] || 50000;
        const ajustePorEstado = objeto.estado === 'nuevo' ? 1.2 : objeto.estado === 'usado' ? 0.8 : 0.5;
        const valorFinal = Math.round(valorEstimado * ajustePorEstado);

        db.run('UPDATE objetos SET valor_estimado = ? WHERE id_objeto = ?', [valorFinal, id_objeto]);

        db.run(
          `INSERT INTO precotizaciones (id_objeto, id_usuario, resultado_valor, confiabilidad, estado)
           VALUES (?, ?, ?, ?, 'completada')`,
          [id_objeto, req.user.id, valorFinal, 0.75],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error al guardar pre-cotización' });
            }

            res.json({
              message: 'Pre-cotización generada exitosamente (modo manual)',
              id_analisis: this.lastID,
              valor_estimado: valorFinal,
              confiabilidad: 0.75,
              monto_prestamo: Math.round(valorFinal * 0.7),
              interes_mensual: Math.round(valorFinal * 0.7 * 0.15)
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al procesar pre-cotización' });
  }
});

// Obtener mis pre-cotizaciones
router.get('/mis-cotizaciones', authMiddleware, (req, res) => {
  const query = `
    SELECT p.*, o.tipo, o.marca, o.modelo, o.descripcion, o.fotos
    FROM precotizaciones p
    JOIN objetos o ON p.id_objeto = o.id_objeto
    WHERE p.id_usuario = ?
    ORDER BY p.fecha_analisis DESC
  `;

  db.all(query, [req.user.id], (err, cotizaciones) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(cotizaciones);
  });
});

module.exports = router;
