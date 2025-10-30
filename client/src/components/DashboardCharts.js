import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/DashboardCharts.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardCharts = () => {
  const [loading, setLoading] = useState(true);
  const [datosGraficos, setDatosGraficos] = useState({
    empenosPorMes: [],
    ingresosMensuales: [],
    objetosMasEmpenados: [],
    estadosEmpenos: {},
    metricas: {}
  });

  useEffect(() => {
    cargarDatosGraficos();
  }, []);

  const cargarDatosGraficos = async () => {
    try {
      const [statsRes, empenosRes, objetosRes] = await Promise.all([
        api.get('/admin/estadisticas'),
        api.get('/admin/empenos/todos'),
        api.get('/admin/objetos')
      ]);

      const empenos = empenosRes.data;
      const objetos = objetosRes.data;

      // Calcular empeños por mes (últimos 6 meses)
      const empenosPorMes = calcularEmpenosPorMes(empenos);
      
      // Calcular ingresos mensuales (intereses)
      const ingresosMensuales = calcularIngresosMensuales(empenos);
      
      // Objetos más empeñados
      const objetosMasEmpenados = calcularObjetosMasEmpenados(empenos);
      
      // Estados de empeños
      const estadosEmpenos = calcularEstadosEmpenos(empenos);
      
      // Métricas adicionales
      const metricas = calcularMetricas(empenos, statsRes.data);

      setDatosGraficos({
        empenosPorMes,
        ingresosMensuales,
        objetosMasEmpenados,
        estadosEmpenos,
        metricas
      });
    } catch (error) {
      console.error('Error al cargar datos de gráficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEmpenosPorMes = (empenos) => {
    const meses = {};
    const hoy = new Date();
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses[key] = 0;
    }

    // Contar empeños por mes
    empenos.forEach(empeno => {
      const fecha = new Date(empeno.fecha_inicio);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      if (meses.hasOwnProperty(key)) {
        meses[key]++;
      }
    });

    return Object.entries(meses).map(([mes, cantidad]) => ({
      mes: formatearMes(mes),
      cantidad
    }));
  };

  const calcularIngresosMensuales = (empenos) => {
    const meses = {};
    const hoy = new Date();
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses[key] = 0;
    }

    // Sumar intereses por mes
    empenos.forEach(empeno => {
      const fecha = new Date(empeno.fecha_inicio);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      if (meses.hasOwnProperty(key)) {
        meses[key] += empeno.interes || 0;
      }
    });

    return Object.entries(meses).map(([mes, total]) => ({
      mes: formatearMes(mes),
      total
    }));
  };

  const calcularObjetosMasEmpenados = (empenos) => {
    const tipos = {};
    
    empenos.forEach(empeno => {
      const tipo = empeno.tipo || 'Otros';
      tipos[tipo] = (tipos[tipo] || 0) + 1;
    });

    return Object.entries(tipos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tipo, cantidad]) => ({ tipo, cantidad }));
  };

  const calcularEstadosEmpenos = (empenos) => {
    const estados = {
      activo: 0,
      finalizado: 0,
      vencido: 0,
      recuperado: 0
    };

    empenos.forEach(empeno => {
      const estado = empeno.estado || 'activo';
      if (estados.hasOwnProperty(estado)) {
        estados[estado]++;
      }
    });

    return estados;
  };

  const calcularMetricas = (empenos, stats) => {
    const empenosActivos = empenos.filter(e => e.estado === 'activo');
    const promedioMonto = empenosActivos.length > 0
      ? empenosActivos.reduce((sum, e) => sum + (e.monto_prestado || 0), 0) / empenosActivos.length
      : 0;

    const totalIntereses = empenos.reduce((sum, e) => sum + (e.interes || 0), 0);
    
    const mesActual = new Date().getMonth();
    const ingresosMesActual = empenos
      .filter(e => new Date(e.fecha_inicio).getMonth() === mesActual)
      .reduce((sum, e) => sum + (e.interes || 0), 0);

    return {
      promedioMonto,
      totalIntereses,
      ingresosMesActual,
      tasaRecuperacion: empenos.length > 0 
        ? ((empenos.filter(e => e.estado === 'finalizado' || e.estado === 'recuperado').length / empenos.length) * 100).toFixed(1)
        : 0
    };
  };

  const formatearMes = (mesKey) => {
    const [year, month] = mesKey.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[parseInt(month) - 1]} ${year}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="charts-loading">
        <div className="spinner"></div>
        <p>Cargando gráficos...</p>
      </div>
    );
  }

  // Configuración del gráfico de línea (Empeños por mes)
  const lineChartData = {
    labels: datosGraficos.empenosPorMes.map(d => d.mes),
    datasets: [
      {
        label: 'Empeños Creados',
        data: datosGraficos.empenosPorMes.map(d => d.cantidad),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '📈 Empeños por Mes (Últimos 6 meses)',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  // Configuración del gráfico de barras (Ingresos mensuales)
  const barChartData = {
    labels: datosGraficos.ingresosMensuales.map(d => d.mes),
    datasets: [
      {
        label: 'Ingresos (Intereses)',
        data: datosGraficos.ingresosMensuales.map(d => d.total),
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(40, 167, 69, 0.8)'
        ],
        borderColor: 'rgb(40, 167, 69)',
        borderWidth: 2
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '💰 Ingresos Mensuales (Intereses)',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (context) => `Intereses: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  // Configuración del gráfico horizontal (Objetos más empeñados)
  const horizontalBarData = {
    labels: datosGraficos.objetosMasEmpenados.map(d => d.tipo),
    datasets: [
      {
        label: 'Cantidad',
        data: datosGraficos.objetosMasEmpenados.map(d => d.cantidad),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }
    ]
  };

  const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '🏆 Top 5 Objetos Más Empeñados',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  // Configuración del gráfico donut (Estados de empeños)
  const doughnutData = {
    labels: ['Activo', 'Finalizado', 'Vencido', 'Recuperado'],
    datasets: [
      {
        data: [
          datosGraficos.estadosEmpenos.activo,
          datosGraficos.estadosEmpenos.finalizado,
          datosGraficos.estadosEmpenos.vencido,
          datosGraficos.estadosEmpenos.recuperado
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)'
        ],
        borderColor: [
          'rgb(40, 167, 69)',
          'rgb(23, 162, 184)',
          'rgb(220, 53, 69)',
          'rgb(255, 193, 7)'
        ],
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: '📊 Distribución de Estados',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  return (
    <div className="dashboard-charts-container">
      {/* KPIs superiores */}
      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💵</div>
          <div className="kpi-content">
            <h4>Promedio Monto</h4>
            <p className="kpi-value">{formatCurrency(datosGraficos.metricas.promedioMonto)}</p>
            <span className="kpi-label">Por empeño activo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h4>Total Intereses</h4>
            <p className="kpi-value">{formatCurrency(datosGraficos.metricas.totalIntereses)}</p>
            <span className="kpi-label">Histórico</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📅</div>
          <div className="kpi-content">
            <h4>Ingresos Mes Actual</h4>
            <p className="kpi-value">{formatCurrency(datosGraficos.metricas.ingresosMesActual)}</p>
            <span className="kpi-label">Este mes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <h4>Tasa Recuperación</h4>
            <p className="kpi-value">{datosGraficos.metricas.tasaRecuperacion}%</p>
            <span className="kpi-label">Empeños finalizados</span>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-wrapper">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrapper">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrapper">
            <Bar data={horizontalBarData} options={horizontalBarOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
