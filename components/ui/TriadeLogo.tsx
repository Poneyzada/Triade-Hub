import React from "react";

interface TriadeLogoProps {
  className?: string;
  size?: number;
}

/**
 * LOGO OFICIAL TRÍADE STUDIO
 * Três traços horizontais elegantes em gradiente azul petróleo / ciano cósmico:
 * Um em cima, um no meio (deslocado) e um embaixo, simbolizando a "Tríade".
 */
export const TriadeLogo: React.FC<TriadeLogoProps> = ({
  className = "",
  size = 40,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradiente baseado na paleta petróleo/ciano cósmico enviada */}
        <linearGradient id="triadeCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="triadeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.1" />
        </linearGradient>

        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Fundo suave com borda arredondada */}
      <rect
        width="44"
        height="44"
        rx="12"
        fill="#07121A"
        stroke="#1E384D"
        strokeWidth="1.2"
      />

      {/* 3 Traços da Tríade (em cima, meio deslocado e embaixo) */}
      <g filter="url(#neonGlow)">
        {/* Traço Superior */}
        <rect
          x="10"
          y="11"
          width="20"
          height="4.5"
          rx="2.25"
          fill="url(#triadeCyanGrad)"
        />

        {/* Traço Central (deslocado para a direita) */}
        <rect
          x="14"
          y="19.75"
          width="20"
          height="4.5"
          rx="2.25"
          fill="url(#triadeCyanGrad)"
        />

        {/* Traço Inferior */}
        <rect
          x="10"
          y="28.5"
          width="20"
          height="4.5"
          rx="2.25"
          fill="url(#triadeCyanGrad)"
        />
      </g>
    </svg>
  );
};
