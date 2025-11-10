import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import "../../../styles/components/progreso/UserProgress.css";

const UserProgress = () => {
  const { theme } = useTheme();
  const [progressData, setProgressData] = useState({
    cvsAnalizados: 0,
    entrevistasRealizadas: 0,
    puntuacionPromedio: 0,
    nivelActual: "Principiante",
    progresoNivel: 0
  });

  useEffect(() => {
    // Aquí deberías hacer una llamada a tu API para obtener el progreso real
    // Por ahora, uso datos de ejemplo
    const fetchProgress = async () => {
      try {
        // const response = await fetch('/api/user/progress');
        // const data = await response.json();

        // Datos de ejemplo
        const mockData = {
          cvsAnalizados: 5,
          entrevistasRealizadas: 3,
          puntuacionPromedio: 75,
          nivelActual: "Intermedio",
          progresoNivel: 60
        };

        setProgressData(mockData);
      } catch (error) {
        console.error("Error al cargar el progreso:", error);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="user-progress-widget" data-theme={theme}>
      <h3 className="progress-title">Tu Progreso</h3>

      <div className="progress-section">
        <div className="progress-stat">
          <div className="stat-icon cv-icon">📄</div>
          <div className="stat-info">
            <span className="stat-label">CVs Analizados</span>
            <span className="stat-value">{progressData.cvsAnalizados}</span>
          </div>
        </div>

        <div className="progress-stat">
          <div className="stat-icon interview-icon">🎤</div>
          <div className="stat-info">
            <span className="stat-label">Entrevistas</span>
            <span className="stat-value">{progressData.entrevistasRealizadas}</span>
          </div>
        </div>

        <div className="progress-stat">
          <div className="stat-icon score-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-label">Puntuación Media</span>
            <span className="stat-value">{progressData.puntuacionPromedio}%</span>
          </div>
        </div>
      </div>

      <div className="level-section">
        <div className="level-header">
          <span className="level-label">Nivel:</span>
          <span className="level-name">{progressData.nivelActual}</span>
        </div>
        <div className="level-progress-bar">
          <div
            className="level-progress-fill"
            style={{ width: `${progressData.progresoNivel}%` }}
          >
            <span className="progress-percentage">{progressData.progresoNivel}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProgress;
