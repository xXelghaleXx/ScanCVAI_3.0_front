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
          {/* Grupo de líneas animadas principales - Todas en diagonal descendente (↘) */}
          <g id="light-blue">
            {/* Lado izquierdo - Líneas diagonales paralelas */}
            <line x1="0" y1="50" x2="200" y2="250" className="line-draw" />
            <line x1="0" y1="250" x2="200" y2="450" className="line-draw" />
            <line x1="0" y1="450" x2="200" y2="650" className="line-draw" />
            <line x1="0" y1="650" x2="200" y2="850" className="line-draw" />
            <line x1="0" y1="850" x2="200" y2="1050" className="line-draw" />

            {/* Centro-izquierdo */}
            <line x1="300" y1="0" x2="550" y2="250" className="line-draw" />
            <line x1="300" y1="200" x2="550" y2="450" className="line-draw" />
            <line x1="300" y1="400" x2="550" y2="650" className="line-draw" />
            <line x1="300" y1="600" x2="550" y2="850" className="line-draw" />
            <line x1="300" y1="800" x2="550" y2="1050" className="line-draw" />

            {/* Centro */}
            <line x1="700" y1="0" x2="950" y2="250" className="line-draw" />
            <line x1="700" y1="200" x2="950" y2="450" className="line-draw" />
            <line x1="700" y1="400" x2="950" y2="650" className="line-draw" />
            <line x1="700" y1="600" x2="950" y2="850" className="line-draw" />
            <line x1="700" y1="800" x2="950" y2="1050" className="line-draw" />

            {/* Centro-derecho */}
            <line x1="1100" y1="0" x2="1350" y2="250" className="line-draw" />
            <line x1="1100" y1="200" x2="1350" y2="450" className="line-draw" />
            <line x1="1100" y1="400" x2="1350" y2="650" className="line-draw" />
            <line x1="1100" y1="600" x2="1350" y2="850" className="line-draw" />
            <line x1="1100" y1="800" x2="1350" y2="1050" className="line-draw" />

            {/* Lado derecho */}
            <line x1="1500" y1="0" x2="1750" y2="250" className="line-draw" />
            <line x1="1500" y1="200" x2="1750" y2="450" className="line-draw" />
            <line x1="1500" y1="400" x2="1750" y2="650" className="line-draw" />
            <line x1="1500" y1="600" x2="1750" y2="850" className="line-draw" />
            <line x1="1500" y1="800" x2="1750" y2="1050" className="line-draw" />

            {/* Extremo derecho */}
            <line x1="1720" y1="50" x2="1920" y2="250" className="line-draw" />
            <line x1="1720" y1="250" x2="1920" y2="450" className="line-draw" />
            <line x1="1720" y1="450" x2="1920" y2="650" className="line-draw" />
            <line x1="1720" y1="650" x2="1920" y2="850" className="line-draw" />
            <line x1="1720" y1="850" x2="1920" y2="1050" className="line-draw" />
          </g>

          {/* Grupo de líneas con efecto pulse - Color 1 */}
          <g id="accent-1">
            <line x1="200" y1="100" x2="450" y2="350" className="line-fade line-fade-1" />
            <line x1="200" y1="500" x2="450" y2="750" className="line-fade line-fade-1" />
            <line x1="600" y1="100" x2="850" y2="350" className="line-fade line-fade-1" />
            <line x1="600" y1="500" x2="850" y2="750" className="line-fade line-fade-1" />
            <line x1="1000" y1="100" x2="1250" y2="350" className="line-fade line-fade-1" />
            <line x1="1000" y1="500" x2="1250" y2="750" className="line-fade line-fade-1" />
            <line x1="1400" y1="100" x2="1650" y2="350" className="line-fade line-fade-1" />
            <line x1="1400" y1="500" x2="1650" y2="750" className="line-fade line-fade-1" />
          </g>

          {/* Grupo de líneas con efecto pulse - Color 2 */}
          <g id="accent-2">
            <line x1="100" y1="150" x2="350" y2="400" className="line-fade line-fade-2" />
            <line x1="100" y1="550" x2="350" y2="800" className="line-fade line-fade-2" />
            <line x1="500" y1="150" x2="750" y2="400" className="line-fade line-fade-2" />
            <line x1="500" y1="550" x2="750" y2="800" className="line-fade line-fade-2" />
            <line x1="900" y1="150" x2="1150" y2="400" className="line-fade line-fade-2" />
            <line x1="900" y1="550" x2="1150" y2="800" className="line-fade line-fade-2" />
            <line x1="1300" y1="150" x2="1550" y2="400" className="line-fade line-fade-2" />
            <line x1="1300" y1="550" x2="1550" y2="800" className="line-fade line-fade-2" />
            <line x1="1570" y1="150" x2="1820" y2="400" className="line-fade line-fade-2" />
            <line x1="1570" y1="550" x2="1820" y2="800" className="line-fade line-fade-2" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Background;