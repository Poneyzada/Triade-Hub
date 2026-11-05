"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Target, Sparkles, FileText, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CrmPage() {
  const pipeline = [
    { title: "Lead Qualificado", count: 3, value: 24000, color: "border-blue-500/40 text-blue-400" },
    { title: "Diagnóstico Feito", count: 2, value: 18500, color: "border-amber-500/40 text-amber-400" },
    { title: "Proposta Enviada", count: 2, value: 32000, color: "border-purple-500/40 text-purple-400" },
    { title: "Em Fechamento", count: 1, value: 12000, color: "border-emerald-500/40 text-emerald-400" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Target className="h-4 w-4" />
              <span>CRM Comercial & Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Propostas Interativas & Leads
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Preparado para a Fase 2: Geração de links públicos (/proposta/[token]) e contratos digitais.
            </p>
          </div>

          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold">
            Fase 2 no Roadmap
          </span>
        </div>

        {/* Banner Informativo da Fase 2 */}
        <div className="rounded-2xl border border-triade-gold/30 bg-gradient-to-r from-triade-gold/10 via-zinc-900/60 to-black p-6">
          <div className="flex items-center gap-2 text-triade-goldLight font-bold text-sm mb-1">
            <Sparkles className="h-4 w-4 text-triade-gold" />
            <span>Módulo CRM Comercial (Arquitetura 100% Modelada em types/database.ts)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
            Na próxima fase, conectaremos o gerador de propostas com precificação dinâmica, aceite digital de escopo e conversão automática de Lead aceito em Cliente com Onboarding gerado instantaneamente!
          </p>
        </div>

        {/* Funil Visual Pré-estruturado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipeline.map((stage, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-card-subtle"
            >
              <div className="flex items-center justify-between pb-3 border-b border-triade-border">
                <h3 className="text-xs font-bold text-zinc-200">{stage.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.color}`}>
                  {stage.count} leads
                </span>
              </div>
              <p className="mt-4 text-xl font-bold text-zinc-100">
                {formatCurrency(stage.value)}
              </p>
              <span className="text-[11px] text-zinc-500">Pipeline potencial</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
