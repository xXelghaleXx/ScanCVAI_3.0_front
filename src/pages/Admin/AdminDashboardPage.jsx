import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminService from '../../services/admin.service';
import LoadingSpinner from "../../components/ui/LoadingSpinner/LoadingSpinner";
import Background from "../../components/layout/Background/Background";
import { toast } from "react-toastify";
import "../../styles/pages/AdminDashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      toast.error("Error cargando dashboard de administrador");

      if (error.response?.status === 403) {
        toast.error("No tienes permisos de administrador");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Background />
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </>
    );
  }

  if (!dashboardData) {
    return (
      <>
        <Background />
        <div className="admin-dashboard-wrapper">
          <div className="admin-dashboard-container">
            <div className="admin-dashboard-header">
              <h1 className="admin-dashboard-title">Dashboard de <span>Administrador</span></h1>
              <p className="admin-dashboard-subtitle">No se pudieron cargar los datos del dashboard.</p>
            </div>
          </div>
      </div>
      </>
    );
  }

  const { resumen, distribucion, tendencias, top_usuarios } = dashboardData;

  // Configuraciones de gráficos
  const usuariosPorMesData = {
    labels: tendencias.usuarios_por_mes.map((item) =>
      new Date(item.mes).toLocaleDateString("es", { month: "short", year: "numeric" })
    ),
    datasets: [
      {
        label: "Nuevos Usuarios",
        data: tendencias.usuarios_por_mes.map((item) => item.cantidad),
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const actividadData = {
    labels: tendencias.cvs_por_mes.map((item) =>
      new Date(item.mes).toLocaleDateString("es", { month: "short", year: "numeric" })
    ),
    datasets: [
      {
        label: "CVs Subidos",
        data: tendencias.cvs_por_mes.map((item) => item.cantidad),
        backgroundColor: "#667eea",
      },
      {
        label: "Entrevistas Realizadas",
        data: tendencias.entrevistas_por_mes.map((item) => item.cantidad),
        backgroundColor: "#10b981",
      },
    ],
  };

  const rolesData = {
    labels: distribucion.por_roles.map((item) => item.rol),
    datasets: [
      {
        data: distribucion.por_roles.map((item) => item.cantidad),
        backgroundColor: ["#667eea", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const estadosData = {
    labels: distribucion.por_estados.map((item) => item.estado),
    datasets: [
      {
        data: distribucion.por_estados.map((item) => item.cantidad),
        backgroundColor: ["#10b981", "#fbbf24", "#ef4444"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  return (
    <>
      <Background />
      <div className="admin-dashboard-wrapper">
        <div className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-dashboard-header">
          <div>
            <h1 className="admin-dashboard-title">
              Dashboard de <span>Administrador</span>
            </h1>
            <p className="admin-dashboard-subtitle">
              Vista general del sistema y métricas de usuarios
            </p>
          </div>

          <div className="admin-actions">
            <button
              onClick={() => navigate("/admin/usuarios")}
              className="admin-btn admin-btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Ver Lista de Usuarios
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="admin-summary-grid">
          <div className="admin-summary-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-label">Total Usuarios</p>
                <p className="admin-card-value">{resumen.total_usuarios}</p>
                <p className="admin-card-footer">
                  <span>✓</span> {resumen.usuarios_activos} activos (últimos 30 días)
                </p>
              </div>
              <div className="admin-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-label">Total CVs</p>
                <p className="admin-card-value">{resumen.total_cvs}</p>
              </div>
              <div className="admin-card-icon green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-label">Total Entrevistas</p>
                <p className="admin-card-value">{resumen.total_entrevistas}</p>
              </div>
              <div className="admin-card-icon purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-label">Promedio Entrevistas</p>
                <p className="admin-card-value">
                  {resumen.promedio_entrevistas_global || "N/A"}
                </p>
                <p className="admin-card-footer">Puntuación sobre 10</p>
              </div>
              <div className="admin-card-icon yellow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="admin-charts-grid">
          <div className="admin-chart-card">
            <h2 className="admin-chart-title">Tendencia de Nuevos Usuarios</h2>
            <div className="admin-chart-container">
              <Line
                data={usuariosPorMesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }}
              />
            </div>
          </div>

          <div className="admin-chart-card">
            <h2 className="admin-chart-title">Actividad del Sistema</h2>
            <div className="admin-chart-container">
              <Bar
                data={actividadData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }}
              />
            </div>
          </div>

          <div className="admin-chart-card">
            <h2 className="admin-chart-title">Distribución de Roles</h2>
            <div className="admin-chart-container">
              <Pie
                data={rolesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>

          <div className="admin-chart-card">
            <h2 className="admin-chart-title">Distribución de Estados</h2>
            <div className="admin-chart-container">
              <Pie
                data={estadosData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Usuarios Activos */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h2 className="admin-table-title">Top 10 Usuarios Más Activos</h2>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th className="center">CVs</th>
                  <th className="center">Entrevistas</th>
                  <th className="center">Total Actividad</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {top_usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="admin-user-info">
                        <span className="admin-user-name">{usuario.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-user-email">{usuario.correo}</span>
                    </td>
                    <td className="center">{usuario.total_cvs}</td>
                    <td className="center">{usuario.total_entrevistas}</td>
                    <td className="center">
                      <span className="admin-badge blue">
                        {parseInt(usuario.total_cvs) + parseInt(usuario.total_entrevistas)}
                      </span>
                    </td>
                    <td className="center">
                      <button
                        onClick={() => navigate(`/admin/usuarios/${usuario.id}`)}
                        className="admin-btn-view"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default AdminDashboard;
