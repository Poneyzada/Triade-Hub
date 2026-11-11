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
  Bot,
  Sliders,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProposalStage, Proposal } from "@/types/database";
import { NewProposalModal } from "@/components/crm/NewProposalModal";
import { LeadScoreBadge } from "@/components/crm/LeadScoreBadge";
import { WhatsAppLiveChatModal } from "@/components/crm/WhatsAppLiveChatModal";
import { AiAgentConfigModal } from "@/components/crm/AiAgentConfigModal";

export default function CrmPage() {
  const {
    proposals,
    updateProposalStage,
    approveAndCloseProposal,
    notifyClientWhatsApp,
    aiAgentConfig,
  } = useTriade();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedChatProposal, setSelectedChatProposal] = useState<Proposal | null>(null);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);

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
            <div className="flex items-center gap-2 text-triade-cyan text-xs font-bold uppercase tracking-wider mb-1">
              <Target className="h-4 w-4" />
              <span>CRM Comercial & Pipeline de Vendas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Kanban de Leads & Propostas Interativas
            </h1>
            <p className="text-sm text-zinc-300 font-medium mt-0.5">
              Acompanhamento de oportunidades comerciais com propostas de alto impacto visual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsAiConfigModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-triade-cyan/40 bg-triade-cyan/10 text-triade-cyanLight text-xs sm:text-sm font-bold hover:bg-triade-cyan/20 transition-all shadow-sm"
              title="Configurar prompts e conexão WhatsApp do Robô SDR"
            >
              <Bot className="h-4 w-4" />
              <span>Robô SDR ({aiAgentConfig.bot_name.split(' ')[0]})</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs sm:text-sm font-bold shadow-blue-glow hover:opacity-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Nova Proposta</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido do Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-300 block mb-1">
              Oportunidades Ativas
            </span>
            <span className="text-xl font-bold text-white">
              {proposals.filter((p) => p.stage !== "perdido" && p.stage !== "fechado").length} Leads
            </span>
          </div>

          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-300 block mb-1">
              Pipeline Setup em Jogo
            </span>
            <span className="text-xl font-bold text-triade-cyanLight">
              {formatCurrency(totalPipelineSetup)}
            </span>
          </div>

          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-300 block mb-1">
              Pipeline MRR Potencial
            </span>
            <span className="text-xl font-bold text-sky-200">
              {formatCurrency(totalPipelineMRR)} /mês
            </span>
          </div>

          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-300 block mb-1">
              Fechados com Sucesso
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {proposals.filter((p) => p.stage === "fechado").length} Contratos
            </span>
          </div>
        </div>

        {/* Quadro Kanban de 6 Colunas (Fluxo Horizontal sem Sobreposição) */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none">
          {columns.map((col) => {
            const colProposals = proposals.filter((p) => p.stage === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-triade-border bg-[#0B1724] p-3.5 w-[285px] sm:w-[310px] flex-shrink-0 min-h-[580px] shadow-sm"
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
                        className="rounded-xl border border-triade-border bg-[#0E1C2A] p-3.5 shadow-sm hover:border-triade-cyan/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-bold uppercase text-triade-cyanLight truncate max-w-[125px]">
                              {prop.company_name}
                            </span>
                            <div className="flex items-center gap-1">
                              {prop.ai_status && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold border flex items-center gap-0.5 ${
                                    prop.ai_status === "handoff_requested"
                                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                                      : prop.ai_status === "bot_active"
                                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                      : prop.ai_status === "human_takeover"
                                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                      : "bg-zinc-800 border-zinc-700 text-zinc-200"
                                  }`}
                                >
                                  {prop.ai_status === "handoff_requested"
                                    ? "⚠️ Handoff"
                                    : prop.ai_status === "bot_active"
                                    ? "🤖 IA Ativa"
                                    : prop.ai_status === "human_takeover"
                                    ? "👤 Atendente"
                                    : "⏸️ Pausado"}
                                </span>
                              )}
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">
                                {prop.service_type}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                            {prop.title}
                          </h4>

                          <p className="text-[11px] text-zinc-200 font-medium mt-1 flex items-center gap-1">
                            <User className="h-3 w-3 text-cyan-400" />
                            <span>{prop.lead_name}</span>
                          </p>

                          {/* Termômetro e Qualificação BANT IA */}
                          <LeadScoreBadge proposal={prop} />

                          {/* Valores */}
                          <div className="mt-2.5 p-2 rounded-lg bg-[#07121A] border border-triade-border space-y-1">
                            {prop.setup_value > 0 && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-300 font-medium">Setup:</span>
                                <span className="font-bold text-zinc-100">
                                  {formatCurrency(prop.setup_value)}
                                </span>
                              </div>
                            )}
                            {prop.monthly_value > 0 && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-300 font-medium">Mensal:</span>
                                <span className="font-bold text-triade-cyanLight">
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
                              onClick={() => setSelectedChatProposal(prop)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors relative"
                              title="Abrir WhatsApp Live Chat & IA"
                            >
                              <Bot className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Chat IA</span>
                              {prop.unread_messages_count ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                              ) : null}
                            </button>

                            <button
                              onClick={() => handleCopyLink(prop.public_token)}
                              title="Copiar link público da proposta"
                              className="p-1.5 rounded-lg border border-triade-border bg-[#07121A] text-zinc-200 hover:text-zinc-100 text-xs flex items-center gap-1"
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
                              className="px-2 py-1 rounded-lg bg-triade-cyan/15 hover:bg-triade-cyan/25 border border-triade-cyan/30 text-triade-cyanLight text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <span>Ver</span>
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
                                className="text-[10px] text-zinc-300 hover:text-zinc-300 flex items-center gap-0.5"
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
                                className="text-[10px] text-zinc-200 hover:text-triade-cyan flex items-center gap-0.5"
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
                    <div className="py-12 text-center text-[11px] text-zinc-300 italic">
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

      <WhatsAppLiveChatModal
        proposal={selectedChatProposal}
        isOpen={!!selectedChatProposal}
        onClose={() => setSelectedChatProposal(null)}
      />

      <AiAgentConfigModal
        isOpen={isAiConfigModalOpen}
        onClose={() => setIsAiConfigModalOpen(false)}
      />
    </AppShell>
  );
}
