"use client";

import React from "react";

// AsciiArt — "sss", made with the 21st ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArt className="absolute inset-0" /></div>
export function AsciiArt({ className = "" }: { className?: string }) {
  return (
    <video
      className={className}
      src="https://assets.21st.dev/ascii-recipes/videos/user_2xJxXqdwWohYrdd6fiMYrS9hbmO/2e358adb-cfc9-4ec4-a600-1abc8836f02b.mp4"
      poster="https://assets.21st.dev/ascii-recipes/thumbnails/user_2xJxXqdwWohYrdd6fiMYrS9hbmO/eae3b158-33e1-442d-8e17-3b4fb6656a7f.webp"
      autoPlay
      loop
      muted
      playsInline
      aria-label="sss — animated ASCII art"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

/**
 * AmbientAsciiBackground — Versão tratada com opacidade perfeita
 * para criar uma atmosfera sci-fi/cosmic dark visível e impactante.
 */
export function AmbientAsciiBackground({
  opacity = "opacity-35",
  className = "",
}: {
  opacity?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
    >
      {/* Camada do Vídeo ASCII com filtro ciano cósmico visível */}
      <div className={`absolute inset-0 ${opacity} mix-blend-screen filter saturate-200 hue-rotate-[185deg]`}>
        <AsciiArt className="h-full w-full" />
      </div>

      {/* Gradiente sutil para manter leitura suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050B11]/40 via-transparent to-[#050B11]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12)_0%,transparent_70%)]" />
    </div>
  );
}
