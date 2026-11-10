import { AsciiArt } from "@/components/ui/sss";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AsciiArtDemoPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Vídeo ASCII puro preenchendo a tela inteira (conforme o prompt) */}
      <AsciiArt className="absolute inset-0 h-full w-full object-cover" />

      {/* Overlay com botão de voltar para o Tríade Hub */}
      <div className="relative z-10 p-6 text-center space-y-4 bg-black/60 backdrop-blur-md rounded-2xl border border-cyan-500/40 max-w-lg mx-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase border border-cyan-500/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Demo Oficial 21st ASCII</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          AsciiArt Video Background
        </h1>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Componente integrado com sucesso ao Tríade Hub em <code>components/ui/sss.tsx</code>.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs font-bold hover:opacity-90 transition-all shadow-blue-glow"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o Painel do Tríade Hub</span>
        </Link>
      </div>
    </div>
  );
}
