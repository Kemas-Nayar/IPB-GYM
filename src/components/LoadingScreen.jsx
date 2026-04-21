import { useEffect, useState } from "react";
import logoNutrigym from "../assets/logo_nutrigym.png";
import "../styles/LoadingScreen.css";

export default function LoadingScreen({ onFinish }) {
  const [fading, setFading] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1000);
    const visibilityTimer = setTimeout(() => setFinished(true), 2200);
    const finishTimer = setTimeout(() => onFinish(), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(visibilityTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (finished) return null;

  return (
    <div className={`loading-screen ${fading ? "fade-out" : ""}`}>
      <div className="loading-logo">
        <img
          src={logoNutrigym}
          alt="NutriGym Club"
          className="logo-circle-img"
        />
      </div>
    </div>
  );
}