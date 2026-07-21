import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import tractorImg from "@/assets/tractor.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"moving" | "fadeout" | "done">("moving");
  const isMobile = useIsMobile();
  const duration = isMobile ? 3000 : 4500;

  useEffect(() => {
    const moveTimer = setTimeout(() => setPhase("fadeout"), duration);
    const fadeTimer = setTimeout(() => {
      setPhase("done");
      onFinish();
    }, duration + 500);
    const handleSkip = () => {
      setPhase("done");
      onFinish();
    };
    
    window.addEventListener("keydown", handleSkip);
    window.addEventListener("mousedown", handleSkip);
    window.addEventListener("touchstart", handleSkip);

    return () => {
      clearTimeout(moveTimer);
      clearTimeout(fadeTimer);
      window.removeEventListener("keydown", handleSkip);
      window.removeEventListener("mousedown", handleSkip);
      window.removeEventListener("touchstart", handleSkip);
    };
  }, [onFinish, duration]);

  if (phase === "done") return null;

  return (
    <div
      onClick={() => {
        setPhase("done");
        onFinish();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background cursor-pointer transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full h-32 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-2 flex items-end"
          style={{
            animation: `tractor-slide ${duration / 1000}s ease-in-out forwards`,
            left: "-160px",
          }}
        >
          <img
            src={tractorImg}
            alt="Trator"
            className="h-24 w-24 object-contain"
            style={{ transform: "scaleX(-1)" }}
          />
          <svg
            width="44"
            height="30"
            viewBox="0 0 44 30"
            className="mb-1 ml-[-8px]"
          >
            <ellipse cx="22" cy="26" rx="22" ry="8" fill="hsl(30, 50%, 35%)" />
            <ellipse cx="22" cy="22" rx="17" ry="10" fill="hsl(30, 50%, 42%)" />
            <ellipse cx="22" cy="19" rx="12" ry="8" fill="hsl(30, 50%, 48%)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/20 rounded" />
      </div>

      <p className="mt-6 text-lg font-bold text-gradient pointer-events-none">Análise Técnica</p>
      <p className="text-sm text-muted-foreground pointer-events-none mb-2">Carregando...</p>
      <p className="text-xs text-muted-foreground/60 animate-pulse pointer-events-none">(Clique ou aperte qualquer tecla para pular)</p>

      <style>{`
        @keyframes tractor-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 160px)); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;