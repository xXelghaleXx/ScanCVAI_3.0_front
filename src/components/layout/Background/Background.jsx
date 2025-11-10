import { useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import "../../../styles/layout/Background.css";

const Background = () => {
  const { theme } = useTheme();
  const svgRef = useRef(null);
  const animationFrameRef = useRef(null);
  const intervalsRef = useRef([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const lines = svgRef.current.querySelectorAll('line');

    // Limpiar intervalos anteriores
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];

    lines.forEach((line, index) => {
      // Calcular longitud de la línea
      const length = Math.sqrt(
        Math.pow(line.x2.baseVal.value - line.x1.baseVal.value, 2) +
        Math.pow(line.y2.baseVal.value - line.y1.baseVal.value, 2)
      );

      // Configurar dasharray
      line.style.strokeDasharray = `${length}`;
      line.style.strokeDashoffset = `${length}`;

      // Función de animación
      const animateLine = () => {
        line.style.strokeDashoffset = `${length}`;

        requestAnimationFrame(() => {
          line.style.strokeDashoffset = '0';
        });
      };

      // Iniciar animación con delay escalonado
      setTimeout(() => {
        animateLine();
      }, index * 80);

      // Repetir la animación cada 5 segundos
      const interval = setInterval(() => {
        animateLine();
      }, 5000 + (index * 80));

      intervalsRef.current.push(interval);
    });

    // Cleanup function
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme]); // Re-ejecutar cuando cambie el tema

  return (
    <div className="background-wrapper" data-theme={theme}>
      <svg  
        ref={svgRef}
        version="1.1"
        id="home-anim"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="background-svg"
      >
        <defs>
          <clipPath id="cache">
            <rect y="0" width="1920" height="1080" />
          </clipPath>
        </defs>

        <g clipPath="url(#cache)">
          {/* Grupo de líneas animadas principales */}
          <g id="light-blue">
            {/* Centro - Líneas principales */}
            <line x1="630.8" y1="894.3" x2="476.3" y2="1048.8" className="line-draw" />
            <line x1="858.2" y1="823.9" x2="1012.7" y2="669.4" className="line-draw" />
            <line x1="1066.9" y1="458.2" x2="912.4" y2="612.7" className="line-draw" />
            <line x1="1294.3" y1="387.8" x2="1448.8" y2="233.3" className="line-draw" />
            <line x1="1503" y1="22.1" x2="1348.5" y2="176.6" className="line-draw" />
            <line x1="895.6" y1="1166.6" x2="1050.1" y2="1012.1" className="line-draw" />
            <line x1="1104.3" y1="800.9" x2="949.8" y2="955.4" className="line-draw" />

            {/* Lado izquierdo */}
            <line x1="100" y1="150" x2="280" y2="330" className="line-draw" />
            <line x1="80" y1="350" x2="260" y2="530" className="line-draw" />
            <line x1="120" y1="550" x2="300" y2="730" className="line-draw" />
            <line x1="90" y1="750" x2="270" y2="930" className="line-draw" />

            {/* Lado derecho */}
            <line x1="1640" y1="150" x2="1820" y2="330" className="line-draw" />
            <line x1="1660" y1="350" x2="1840" y2="530" className="line-draw" />
            <line x1="1620" y1="550" x2="1800" y2="730" className="line-draw" />
            <line x1="1650" y1="750" x2="1830" y2="930" className="line-draw" />
          </g>

          {/* Grupo de líneas con efecto pulse - Color 1 */}
          <g id="accent-1">
            {/* Centro */}
            <line x1="794.4" y1="883.4" x2="639.8" y2="1037.9" className="line-fade line-fade-1" />
            <line x1="694.6" y1="834.8" x2="849.2" y2="680.3" className="line-fade line-fade-1" />
            <line x1="1230.4" y1="447.3" x2="1075.9" y2="601.8" className="line-fade line-fade-1" />

            {/* Lado izquierdo */}
            <line x1="150" y1="200" x2="320" y2="370" className="line-fade line-fade-1" />
            <line x1="130" y1="600" x2="300" y2="770" className="line-fade line-fade-1" />

            {/* Lado derecho */}
            <line x1="1600" y1="200" x2="1770" y2="370" className="line-fade line-fade-1" />
            <line x1="1620" y1="600" x2="1790" y2="770" className="line-fade line-fade-1" />
          </g>

          {/* Grupo de líneas con efecto pulse - Color 2 */}
          <g id="accent-2">
            {/* Centro */}
            <line x1="225.8" y1="1151" x2="534.9" y2="841.9" className="line-fade line-fade-2" />
            <line x1="827.1" y1="1003.3" x2="518" y2="1312.3" className="line-fade line-fade-2" />
            <line x1="661.9" y1="714.9" x2="971" y2="405.9" className="line-fade line-fade-2" />

            {/* Lado izquierdo */}
            <line x1="180" y1="400" x2="350" y2="570" className="line-fade line-fade-2" />
            <line x1="160" y1="800" x2="330" y2="970" className="line-fade line-fade-2" />

            {/* Lado derecho */}
            <line x1="1570" y1="400" x2="1740" y2="570" className="line-fade line-fade-2" />
            <line x1="1590" y1="800" x2="1760" y2="970" className="line-fade line-fade-2" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Background;