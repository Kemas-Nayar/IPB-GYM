import { useEffect, useState, useRef } from "react";
import logoNutrigym from "../assets/logo_nutrigym.png";
import "../styles/LoadingScreen.css";

export default function LoadingScreen({ onFinish }) {
  const [fading, setFading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const finishCalledRef = useRef(false);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        const increment = prev < 60 ? 2 : prev < 85 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 20);

    const minDisplayTimer = setTimeout(() => {
      setFading(true);
    }, 3000);

    const visibilityTimer = setTimeout(() => {
      setFinished(true);
    }, 4200);

    return () => {
      clearTimeout(minDisplayTimer);
      clearTimeout(visibilityTimer);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (finished && !finishCalledRef.current) {
      finishCalledRef.current = true;
      const unmountTimer = setTimeout(() => {
        setLoading(false);
        onFinish();
      }, 1200);
      return () => clearTimeout(unmountTimer);
    }
  }, [finished, onFinish]);

  if (!loading) return null;

  return (
    <div className={`ls-screen ${fading ? "ls-fade-out" : ""}`}>

      <div className="ls-orb ls-orb-1" />
      <div className="ls-orb ls-orb-2" />
      <div className="ls-orb ls-orb-3" />

      {[...Array(12)].map((_, i) => (
        <div key={i} className={`ls-particle ls-particle-${i + 1}`} />
      ))}

      {/* Glass container */}
      <div className="ls-glass">

        {/* Ambient glow */}
        <div className="ls-glow" />

        {/* Rotating ring */}
        <div className="ls-ring-outer">
          <div className="ls-ring-inner" />
        </div>

        {/* Logo */}
        <div className="ls-logo-wrap">
          <img
            src={logoNutrigym}
            alt="NutriGym Club"
            className="ls-logo"
          />
        </div>

      </div>

      {/* Text */}
      <p className="ls-tagline">Preparing your experience</p>
      <p className="ls-brand">IPB Wellness Hub</p>

    </div>
  );
}