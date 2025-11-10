import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import "../../../styles/layout/Loader.css";

const Loader = () => {
  const { theme } = useTheme();

  return (
    <div className="loader-overlay" data-theme={theme}>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Cargando...</p>
      </div>
    </div>
  );
};

export default Loader;
