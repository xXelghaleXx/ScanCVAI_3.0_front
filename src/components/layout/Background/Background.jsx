import { useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import "../../../styles/layout/Background.css";

const Background = () => {
  const { theme } = useTheme();
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const lines = svgRef.current.querySelectorAll('line');

    lines.forEach((line, index) => {
      // Animación de las líneas
      const animateLine = () => {
        const length = Math.sqrt(
          Math.pow(line.x2.baseVal.value - line.x1.baseVal.value, 2) +
          Math.pow(line.y2.baseVal.value - line.y1.baseVal.value, 2)
        );

        line.style.strokeDasharray = `${length}`;
        line.style.strokeDashoffset = `${length}`;

        // Trigger animation
        setTimeout(() => {
          line.style.strokeDashoffset = '0';
        }, index * 100);
      };

      animateLine();

      // Repetir la animación
      const interval = setInterval(animateLine, 4000 + (index * 100));

      return () => clearInterval(interval);
    });
  }, []);

  return (
    <div className="background-wrapper" data-theme={theme}>
      <svg
        ref={svgRef}
        version="1.1"
        id="home-anim"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1820 1080"
        className="background-svg"
      >
        <g id="home">
          <defs>
            <rect id="masque" y="0.4" width="1820" height="1080" />
          </defs>
          <clipPath id="cache">
            <use xlinkHref="#masque" style={{ overflow: "visible" }} />
          </clipPath>
          <g id="light-blue">
            {/* Líneas originales */}
            <line x1="630.8" y1="894.3" x2="476.3" y2="1048.8" className="line-draw" />
            <line x1="858.2" y1="823.9" x2="1012.7" y2="669.4" className="line-draw" />
            <line x1="1066.9" y1="458.2" x2="912.4" y2="612.7" className="line-draw" />
            <line x1="1294.3" y1="387.8" x2="1448.8" y2="233.3" className="line-draw" />
            <line x1="1503" y1="22.1" x2="1348.5" y2="176.6" className="line-draw" />
            <line x1="895.6" y1="1166.6" x2="1050.1" y2="1012.1" className="line-draw" />
            <line x1="1104.3" y1="800.9" x2="949.8" y2="955.4" className="line-draw" />

            {/* Líneas adicionales para los costados */}
            <line x1="50" y1="100" x2="200" y2="250" className="line-draw" />
            <line x1="50" y1="300" x2="200" y2="450" className="line-draw" />
            <line x1="50" y1="500" x2="200" y2="650" className="line-draw" />
            <line x1="50" y1="700" x2="200" y2="850" className="line-draw" />
            <line x1="50" y1="900" x2="200" y2="1050" className="line-draw" />

            <line x1="1620" y1="100" x2="1770" y2="250" className="line-draw" />
            <line x1="1620" y1="300" x2="1770" y2="450" className="line-draw" />
            <line x1="1620" y1="500" x2="1770" y2="650" className="line-draw" />
            <line x1="1620" y1="700" x2="1770" y2="850" className="line-draw" />
            <line x1="1620" y1="900" x2="1770" y2="1050" className="line-draw" />
          </g>
          <g id="red">
            {/* Líneas originales */}
            <line x1="794.4" y1="883.4" x2="639.8" y2="1037.9" className="line-fade" />
            <line x1="694.6" y1="834.8" x2="849.2" y2="680.3" className="line-fade" />
            <line x1="1230.4" y1="447.3" x2="1075.9" y2="601.8" className="line-fade" />

            {/* Líneas adicionales para los costados */}
            <line x1="100" y1="150" x2="250" y2="300" className="line-fade" />
            <line x1="100" y1="350" x2="250" y2="500" className="line-fade" />
            <line x1="100" y1="550" x2="250" y2="700" className="line-fade" />
            <line x1="100" y1="750" x2="250" y2="900" className="line-fade" />
            <line x1="100" y1="950" x2="250" y2="1100" className="line-fade" />

            <line x1="1670" y1="150" x2="1820" y2="300" className="line-fade" />
            <line x1="1670" y1="350" x2="1820" y2="500" className="line-fade" />
            <line x1="1670" y1="550" x2="1820" y2="700" className="line-fade" />
            <line x1="1670" y1="750" x2="1820" y2="900" className="line-fade" />
            <line x1="1670" y1="950" x2="1820" y2="1100" className="line-fade" />
          </g>
          <g id="blue">
            {/* Líneas originales */}
            <line x1="225.8" y1="1151" x2="534.9" y2="841.9" className="line-fade" />
            <line x1="827.1" y1="1003.3" x2="518" y2="1312.3" className="line-fade" />
            <line x1="661.9" y1="714.9" x2="971" y2="405.9" className="line-fade" />

            {/* Líneas adicionales para los costados */}
            <line x1="150" y1="200" x2="300" y2="350" className="line-fade" />
            <line x1="150" y1="400" x2="300" y2="550" className="line-fade" />
            <line x1="150" y1="600" x2="300" y2="750" className="line-fade" />
            <line x1="150" y1="800" x2="300" y2="950" className="line-fade" />
            <line x1="150" y1="1000" x2="300" y2="1150" className="line-fade" />

            <line x1="1570" y1="200" x2="1720" y2="350" className="line-fade" />
            <line x1="1570" y1="400" x2="1720" y2="550" className="line-fade" />
            <line x1="1570" y1="600" x2="1720" y2="750" className="line-fade" />
            <line x1="1570" y1="800" x2="1720" y2="950" className="line-fade" />
            <line x1="1570" y1="1000" x2="1720" y2="1150" className="line-fade" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Background;
