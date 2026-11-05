"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Building,
  User,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProposalStage, Proposal } from "@/types/database";
import { NewProposalModal } from "@/components/crm/NewProposalModal";

export default function CrmPage() {
  const {
    proposals,
    updateProposalStage,
    approveAndCloseProposal,
    notifyClientWhatsApp,
  } = useTriade();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const columns: { id: ProposalStage; label: string; color: string; badgeBg: string }[] = [
    { id: "prospeccao", label: "Prospecção", color: "border-blue-500", badgeBg: "bg-blue-500/15 text-blue-400" },
    { id: "reuniao", label: "Reunião Agendada", color: "border-amber-500", badgeBg: "bg-amber-500/15 text-amber-300" },
    { id: "proposta_enviada", label: "Proposta Enviada", color: "border-purple-500", badgeBg: "bg-purple-500/15 text-purple-300" },
    { id: "negociacao", label: "Negociação", color: "border-cyan-500", badgeBg: "bg-cyan-500/15 text-cyan-300" },
    { id: "fechado", label: "Fechado / Ganho 🎉", color: "border-emerald-500", badgeBg: "bg-emerald-500/15 text-emerald-400" },
    { id: "perdido", label: "Perdido", color: "border-red-500", badgeBg: "bg-red-500/15 text-red-400" },
  ];

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/proposta/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getNextStage = (current: ProposalStage): ProposalStage | null => {
    const stages: ProposalStage[] = ["prospeccao", "reuniao", "proposta_enviada", "negociacao", "fechado"];
    const idx = stages.indexOf(current);
    if (idx >= 0 && idx < stages.length - 1) return stages[idx + 1];
    return null;
  };

  const getPrevStage = (current: ProposalStage): ProposalStage | null => {
    const stages: ProposalStage[] = ["prospeccao", "reuniao", "proposta_enviada", "negociacao", "fechado"];
    const idx = stages.indexOf(current);
    if (idx > 0) return stages[idx - 1];
    return null;
  };

  const handleCloseDeal = async (prop: Proposal) => {
    if (confirm(`Confirmar fechamento com ${prop.company_name}? Isso criará automaticamente o cliente, contrato e onboarding.`)) {
      const res = await approveAndCloseProposal(prop.id);
      alert(`🎉 Parabéns! Cliente ${res.client.company_name} criado e Onboarding disparado!`);
    }
  };

  const totalPipelineMRR = proposals
    .filter((p) => p.stage !== "perdido")
    .reduce((sum, p) => sum + p.monthly_value, 0);

  const totalPipelineSetup = proposals
    .filter((p) => p.stage !== "perdido")
    .reduce((sum, p) => sum + p.setup_value, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header do CRM */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Target className="h-4 w-4" />
              <span>CRM Comercial & Pipeline de Vendas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Kanban de Leads & Propostas Interativas
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Acompanhamento de oportunidades comerciais com propostas de alto impacto visual.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-triade-goldLight via-triade-gold to-triade-goldDark text-black text-xs sm:text-sm font-bold shadow-gold-glow hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nova Proposta</span>
          </button>
        </div>

        {/* Resumo Rápido do Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-triade-border bg-[#121215] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Oportunidades Ativas
            </span>
            <span className="text-xl font-bold text-zinc-100">
              {proposals.filter((p) => p.stage !== "perdido" && p.stage !== "fechado").length} Leads
            </span>
          </div>

          <div className="rounded-xl border border-triade-border bg-[#121215] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Pipeline Setup em Jogo
            </span>
            <span className="text-xl font-bold text-triade-cyanLight">
              {formatCurrency(totalPipelineSetup)}
            </span>
          </div>

          <div className="rounded-xl border border-triade-border bg-[#121215] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Pipeline MRR Potencial
            </span>
            <span className="text-xl font-bold text-triade-goldLight">
              {formatCurrency(totalPipelineMRR)} /mês
            </span>
          </div>

          <div className="rounded-xl border border-triade-border bg-[#121215] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Fechados com Sucesso
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {proposals.filter((p) => p.stage === "fechado").length} Contratos
            </span>
          </div>
        </div>

        {/* Quadro Kanban de 6 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colProposals = proposals.filter((p) => p.stage === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-triade-border bg-[#0E0F13] p-3.5 min-w-[260px] min-h-[550px]"
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-triade-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-200">{col.label}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeBg}`}>
                      {colProposals.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colProposals.map((prop) => {
                    const next = getNextStage(prop.stage);
                    const prev = getPrevStage(prop.stage);

                    return (
                      <div
                        key={prop.id}
                        className="rounded-xl border border-triade-border bg-[#14151B] p-3.5 shadow-sm hover:border-triade-gold/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-bold uppercase text-triade-gold truncate max-w-[140px]">
                              {prop.company_name}
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-semibold">
                              {prop.service_type}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                            {prop.title}
                          </h4>

                          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                            <User className="h-3 w-3 text-zinc-500" />
                            <span>{prop.lead_name}</span>
                          </p>

                          {/* Valores */}
                          <div className="mt-3 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                            {prop.setup_value > 0 && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-500">Setup:</span>
                                <span className="font-bold text-zinc-200">
                                  {formatCurrency(prop.setup_value)}
                                </span>
                              </div>
                            )}
                            {prop.monthly_value > 0 && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-500">Mensal:</span>
                                <span className="font-bold text-triade-goldLight">
                                  {formatCurrency(prop.monthly_value)}/mês
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações do Card */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <button
                              onClick={() => handleCopyLink(prop.public_token)}
                              title="Copiar link público da proposta"
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs flex items-center gap-1"
                            >
                              {copiedToken === prop.public_token ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>

                            <a
                              href={`/proposta/${prop.public_token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-triade-gold/15 hover:bg-triade-gold/25 border border-triade-gold/30 text-triade-goldLight text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <span>Ver Proposta</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>

                            <a
                              href={`https://wa.me/${prop.lead_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `Olá ${prop.lead_name}! Segue a proposta estratégica da Tríade Studio: ${
                                  typeof window !== "undefined" ? window.location.origin : ""
                                }/proposta/${prop.public_token}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
                              title="Enviar proposta via WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          </div>

                          {/* Movimentação de Coluna */}
                          <div className="flex items-center justify-between pt-1">
                            {prev ? (
                              <button
                                onClick={() => updateProposalStage(prop.id, prev)}
                                className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5"
                              >
                                <ArrowLeft className="h-2.5 w-2.5" />
                                <span>Voltar</span>
                              </button>
                            ) : <div />}

                            {prop.stage !== "fechado" && (
                              <button
                                onClick={() => handleCloseDeal(prop)}
                                className="text-[10px] font-bold text-emerald-400 hover:underline"
                              >
                                Fechar Venda ✓
                              </button>
                            )}

                            {next ? (
                              <button
                                onClick={() => updateProposalStage(prop.id, next)}
                                className="text-[10px] text-zinc-400 hover:text-triade-gold flex items-center gap-0.5"
                              >
                                <span>Avançar</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            ) : <div />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colProposals.length === 0 && (
                    <div className="py-12 text-center text-[11px] text-zinc-600 italic">
                      Nenhum lead nesta fase
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </AppShell>
  );
}
