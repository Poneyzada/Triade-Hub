"use client";

import React, { useState } from "react";
import { Flame, Zap, Snowflake, Info, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Proposal } from "@/types/database";

interface LeadScoreBadgeProps {
  proposal: Proposal;
  compact?: boolean;
}

export function LeadScoreBadge({ proposal, compact = false }: LeadScoreBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  const score = proposal.lead_score ?? 30;
  const band = proposal.score_band ?? (score >= 71 ? "quente" : score >= 41 ? "morno" : "frio");
  const bant = proposal.bant_qualification || {};

  const bandConfig = {
    quente: {
      label: "Quente",
      icon: Flame,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      barBg: "bg-gradient-to-r from-amber-500 to-cyan-400",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    },
    morno: {
      label: "Morno",
      icon: Zap,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      barBg: "bg-gradient-to-r from-cyan-500 to-sky-400",
      glow: "shadow-[0_0_10px_rgba(34,211,238,0.2)]",
    },
    frio: {
      label: "Frio",
      icon: Snowflake,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      barBg: "bg-sky-500/50",
      glow: "",
    },
  }[band];

  const Icon = bandConfig.icon;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${bandConfig.border} ${bandConfig.bg} text-[10px] font-bold ${bandConfig.color} ${bandConfig.glow}`}
      >
        <Icon className="h-3 w-3" />
        <span>{score} pts</span>
      </div>
    );
  }

  return (
    <div className={`mt-2.5 rounded-xl border ${bandConfig.border} bg-[#07121A]/80 p-2.5 text-xs transition-all`}>
      {/* Barra de Progresso e Score */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-md ${bandConfig.bg} ${bandConfig.color}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-300 font-bold block leading-none">
              Lead Score
            </span>
            <span className={`text-xs font-black ${bandConfig.color}`}>
              {score} / 100 • {bandConfig.label}
            </span>
          </div>
        </div>

        {/* Chips BANT */}
        <div className="flex items-center gap-1" title="Qualificação BANT (Orçamento, Decisor, Necessidade, Prazo)">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border ${
              bant.budget
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
            title={bant.budget ? "Orçamento Qualificado ✓" : "Orçamento Pendente"}
          >
            B
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border ${
              bant.authority
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
            title={bant.authority ? "Decisor Identificado ✓" : "Decisor Pendente"}
          >
            A
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border ${
              bant.need
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
            title={bant.need ? "Necessidade Mapeada ✓" : "Necessidade Pendente"}
          >
            N
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border ${
              bant.timing
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
            title={bant.timing ? "Prazo / Urgência Alinhado ✓" : "Prazo Pendente"}
          >
            T
          </span>
        </div>
      </div>

      {/* Barra Termômetro */}
      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mb-1.5">
        <div
          className={`h-full ${bandConfig.barBg} transition-all duration-500 rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Motivo do Score com Botão de Detalhes */}
      {proposal.score_reason && (
        <div className="pt-1 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-[10px] text-zinc-300 hover:text-white transition-colors text-left"
          >
            <span className="truncate max-w-[200px] text-[10px] text-zinc-300">
              {proposal.score_reason}
            </span>
            {showDetails ? (
              <ChevronUp className="h-3 w-3 flex-shrink-0 text-cyan-400" />
            ) : (
              <ChevronDown className="h-3 w-3 flex-shrink-0 text-zinc-400" />
            )}
          </button>

          {showDetails && (
            <div className="mt-2 p-2 rounded-lg bg-[#050B11] border border-triade-border text-[10px] space-y-1.5">
              <div className="flex items-center gap-1 text-triade-cyan font-bold">
                <ShieldCheck className="h-3 w-3" />
                <span>Auditoria da Pontuação (Deskcomm Formula)</span>
              </div>
              <p className="text-zinc-100 font-medium leading-relaxed">
                {proposal.score_reason}
              </p>
              {proposal.bant_qualification?.notes && (
                <div className="pt-1 text-zinc-200 border-t border-zinc-800">
                  <span className="text-triade-cyanLight font-semibold">Nota da IA: </span>
                  {proposal.bant_qualification.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
