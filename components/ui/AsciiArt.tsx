"use client";

import React from "react";

// AsciiArt — "sss", made with the 21st ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArt className="absolute inset-0" /></div>
export function AsciiArt({ className }: { className?: string }) {
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
 * AmbientAsciiBackground — Versão tratada com opacidade suave e gradiente
 * para criar uma atmosfera sci-fi/cosmic dark sem comprometer a legibilidade.
 */
export function AmbientAsciiBackground({
  opacity = "opacity-15",
  className = "",
}: {
  opacity?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden ${className}`}
    >
      {/* Camada do Vídeo ASCII com filtro e blend mode */}
      <div className={`absolute inset-0 ${opacity} mix-blend-screen filter saturate-150 hue-rotate-[190deg]`}>
        <AsciiArt className="h-full w-full" />
      </div>

      {/* Vinheta gradiente de proteção para manter os cards e textos 100% legíveis */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050B11]/80 via-[#050B11]/60 to-[#050B11]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.1),rgba(5,11,17,0))]" />
    </div>
  );
}
