import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../services/adminService";
import Background from "./Background";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Star, FileText, MessageCircle } from "lucide-react";
import { Line } from "react-chartjs-2";
import "../styles/UserMetrics.css";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function UserMetrics() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState(null);

  useEffect(() => {
    loadUserMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUserMetrics = async () => {
    try {
      setLoading(true);
      console.log("Cargando métricas para usuario ID:", userId);
      const response = await adminService.getUserMetrics(userId);
      console.log("Respuesta del servidor:", response);
      setUserMetrics(response.data);
    } catch (error) {
      console.error("Error cargando métricas del usuario:", error);
      console.error("Error response:", error.response);
      toast.error("Error cargando métricas del usuario");

      if (error.response?.status === 403) {
        toast.error("No tienes permisos de administrador");
        navigate("/");
      } else if (error.response?.status === 404) {
        toast.error("Usuario no encontrado");
        navigate("/admin/usuarios");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Background />
        <div className="user-metrics-loading">
          <div className="user-metrics-spinner"></div>
          <p>Cargando métricas...</p>
        </div>
      </>
    );
  }

  if (!userMetrics) {
    return (
      <>
        <Background />
        <div className="user-metrics-wrapper">
          <div className="user-metrics-container">
            <h1 className="user-metrics-header-content">Métricas de Usuario</h1>
            <p>No se pudieron cargar las métricas del usuario.</p>
          </div>
        </div>
      </>
    );
  }

  const { usuario, metricas } = userMetrics;

  // Validar que las métricas existan
  if (!usuario || !metricas) {
    return (
      <>
        <Background />
        <div className="user-metrics-wrapper">
          <div className="user-metrics-container">
            <h1>Error en datos de métricas</h1>
            <p>Los datos del usuario o las métricas no están disponibles.</p>
          </div>
        </div>
      </>
    );
  }

  // Datos para gráfico de tendencia de entrevistas
  const tendenciaData = {
    labels: (metricas.tendencia_entrevistas || []).map((item) =>
      new Date(item.fecha).toLocaleDateString("es", { day: "2-digit", month: "short" })
    ),
    datasets: [
      {
        label: "Puntuación",
        data: (metricas.tendencia_entrevistas || []).map((item) => item.promedio_puntuacion),
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <>
      <Background />
      <div className="user-metrics-wrapper">
        <div className="user-metrics-container">
        {/* Header */}
        <div className="user-metrics-header">
          <div className="user-metrics-header-content">
            <h1>Métricas de {usuario.nombre}</h1>
            <p>{usuario.correo}</p>
          </div>
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="user-metrics-back-btn"
          >
            Volver a la Lista
          </button>
        </div>

        {/* Información del usuario */}
        <div className="user-info-card">
          <h2 className="user-info-title">Información del Usuario</h2>
          <div className="user-info-grid">
            <div className="user-info-item">
              <p className="user-info-label">Rol</p>
              <span className={`user-metrics-badge ${usuario.rol}`}>
                {usuario.rol}
              </span>
            </div>
            <div className="user-info-item">
              <p className="user-info-label">Estado</p>
              <span className={`user-metrics-badge ${usuario.estado}`}>
                {usuario.estado}
              </span>
            </div>
            <div className="user-info-item">
              <p className="user-info-label">Fecha de Registro</p>
              <p className="user-info-value">
                {new Date(usuario.fecha_registro).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="user-info-item">
              <p className="user-info-label">Último Acceso</p>
              <p className="user-info-value">
                {usuario.ultimo_acceso
                  ? new Date(usuario.ultimo_acceso).toLocaleDateString("es", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Nunca"}
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="metrics-summary-grid">
          <div className="metrics-summary-card">
            <div className="metrics-card-content">
              <div className="metrics-card-text">
                <p className="metrics-card-label">Total CVs</p>
                <p className="metrics-card-value">{metricas.resumen?.total_cvs || 0}</p>
              </div>
              <div className="metrics-card-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="metrics-summary-card">
            <div className="metrics-card-content">
              <div className="metrics-card-text">
                <p className="metrics-card-label">Total Entrevistas</p>
                <p className="metrics-card-value">{metricas.resumen?.total_entrevistas || 0}</p>
              </div>
              <div className="metrics-card-icon purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="metrics-summary-card">
            <div className="metrics-card-content">
              <div className="metrics-card-text">
                <p className="metrics-card-label">Total Informes</p>
                <p className="metrics-card-value">{metricas.resumen?.total_informes || 0}</p>
              </div>
              <div className="metrics-card-icon green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="metrics-summary-card">
            <div className="metrics-card-content">
              <div className="metrics-card-text">
                <p className="metrics-card-label">Promedio</p>
                <p className="metrics-card-value">
                  {metricas.resumen?.estadisticas_entrevistas?.promedio
                    ? parseFloat(metricas.resumen.estadisticas_entrevistas.promedio).toFixed(2)
                    : "N/A"}
                </p>
              </div>
              <div className="metrics-card-icon yellow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de tendencia */}
        {metricas.tendencia_entrevistas && metricas.tendencia_entrevistas.length > 0 && (
          <div className="metrics-chart-card">
            <h2 className="metrics-chart-title">
              Tendencia de Entrevistas (Últimos 3 meses)
            </h2>
            <div className="metrics-chart-container">
              <Line
                data={tendenciaData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 10,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        <div className="metrics-content-grid">
          {/* CVs recientes */}
          <div className="metrics-list-card">
            <h2 className="metrics-list-title">CVs Recientes</h2>
            {metricas.cvs_recientes && metricas.cvs_recientes.length > 0 ? (
              <div className="metrics-list-items">
                {metricas.cvs_recientes.map((cv) => (
                  <div key={cv.id} className="cv-item">
                    <p className="cv-item-name">{cv.archivo}</p>
                    <div className="cv-item-footer">
                      <p className="cv-item-date">
                        {new Date(cv.fecha).toLocaleDateString("es")}
                      </p>
                      <span className={`cv-item-status ${cv.procesado ? "procesado" : "pendiente"}`}>
                        {cv.procesado ? "Procesado" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="metrics-empty">No hay CVs registrados</p>
            )}
          </div>

          {/* Entrevistas recientes */}
          <div className="metrics-list-card">
            <h2 className="metrics-list-title">Entrevistas Recientes</h2>
            {metricas.entrevistas_recientes && metricas.entrevistas_recientes.length > 0 ? (
              <div className="metrics-list-items">
                {metricas.entrevistas_recientes.map((entrevista) => (
                  <div key={entrevista.id} className="entrevista-item">
                    <div className="entrevista-item-header">
                      <p className="entrevista-item-date">
                        {new Date(entrevista.fecha).toLocaleDateString("es")}
                      </p>
                      {entrevista.promedio_puntuacion && (
                        <span className="entrevista-item-score">
                          <Star size={14} /> {entrevista.promedio_puntuacion.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {entrevista.resultado_final && (
                      <p className="entrevista-item-result">{entrevista.resultado_final}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="metrics-empty">No hay entrevistas registradas</p>
            )}
          </div>
        </div>

        {/* Últimas actividades */}
        <div className="activities-card">
          <h2 className="activities-title">Últimas Actividades</h2>
          {metricas.ultimas_actividades && metricas.ultimas_actividades.length > 0 ? (
            <div className="activities-list">
              {metricas.ultimas_actividades.map((actividad, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-content">
                    <span className="activity-icon">
                      {actividad.tipo === "cv" ? <FileText size={18} /> : <MessageCircle size={18} />}
                    </span>
                    <p className="activity-description">{actividad.descripcion}</p>
                  </div>
                  <p className="activity-date">
                    {new Date(actividad.fecha).toLocaleDateString("es", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="metrics-empty">No hay actividades registradas</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default UserMetrics;
