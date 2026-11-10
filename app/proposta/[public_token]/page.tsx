"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  DollarSign,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  ExternalLink,
  MessageSquare,
  Check,
  AlertCircle,
  Building,
} from "lucide-react";
import { useTriade } from "@/lib/store";
import { TriadeLogo } from "@/components/ui/TriadeLogo";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AmbientAsciiBackground } from "@/components/ui/AsciiArt";

export default function PublicProposalPage() {
  const params = useParams();
  const router = useRouter();
  const publicToken = (params?.public_token as string) || "";
  const { getProposalByToken, approveAndCloseProposal, workspace, isLoaded } = useTriade();

  const [isApproving, setIsApproving] = useState(false);
  const [successRedirectUrl, setSuccessRedirectUrl] = useState<string | null>(null);

  const proposal = getProposalByToken(publicToken);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050B11] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-triade-cyan border-t-transparent" />
          <span className="text-sm font-medium">Carregando proposta comercial...</span>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#050B11] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-zinc-100">Proposta Não Encontrada</h1>
        <p className="text-sm text-zinc-400 max-w-md mt-2">
          Não localizamos nenhuma proposta ativa para este link. Verifique a URL ou solicite uma nova apresentação comercial.
        </p>
      </div>
    );
  }

  const isClosed = proposal.stage === "fechado" || proposal.status === "fechado";

  const handleApproveProposal = async () => {
    try {
      setIsApproving(true);
      const { client } = await approveAndCloseProposal(proposal.id);
      const targetUrl = `/portal/${client.portal_token}`;
      setSuccessRedirectUrl(targetUrl);
      setTimeout(() => {
        router.push(targetUrl);
      }, 1500);
    } catch (err) {
      alert("Erro ao aprovar proposta. Tente novamente.");
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B11] text-zinc-200 flex flex-col items-center relative overflow-x-hidden">
      <AmbientAsciiBackground opacity="opacity-20" />

      {/* Top Brand Header */}
      <header className="w-full border-b border-triade-border bg-[#08131F]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TriadeLogo size={36} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">
                {workspace.name}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Apresentação Estratégica de Serviços</p>
          </div>
        </div>

        <a
          href={`https://wa.me/5511999999999?text=${encodeURIComponent(
            `Olá! Gostaria de tirar uma dúvida sobre a proposta da ${proposal.company_name}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tirar Dúvidas no WhatsApp</span>
        </a>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 sm:px-6 py-8 space-y-8 flex-1 z-10">
        {/* Banner de Sucesso pós-aprovação */}
        {successRedirectUrl && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center animate-pulse">
            <h3 className="text-lg font-bold text-emerald-300">
              🎉 Proposta Aprovada com Sucesso!
            </h3>
            <p className="text-xs text-zinc-300 mt-1">
              Redirecionando você para o seu novo Portal VIP do Cliente e Contrato Digital...
            </p>
          </div>
        )}

        {/* Hero Section */}
        <div className="rounded-3xl border border-triade-border bg-gradient-to-b from-[#0E1C2A] to-[#08131F] p-6 sm:p-10 shadow-card-subtle relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-triade-cyan/30 bg-triade-cyan/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-triade-cyanLight mb-3">
                <Sparkles className="h-3.5 w-3.5 text-triade-cyan" />
                <span>Proposta Comercial Personalizada</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-100 tracking-tight">
                {proposal.company_name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 mt-1">
                A/C: <span className="text-triade-cyanLight font-bold">{proposal.lead_name}</span> • {proposal.title}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                  isClosed
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-triade-cyan/15 text-triade-cyanLight border-triade-cyan/30"
                }`}
              >
                {isClosed ? "✓ Proposta Aprovada" : `Válida até ${formatDate(proposal.valid_until)}`}
              </span>
              <span className="text-[11px] text-zinc-400">
                Criada por {workspace.name}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Diagnóstico e Objetivo Estratégico */}
        {proposal.diagnosis && (
          <div className="rounded-2xl border border-triade-border bg-[#0B1724] p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-triade-cyan text-xs font-bold uppercase tracking-wider">
              <Shield className="h-4 w-4" />
              <span>1. Diagnóstico Estratégico & Cenário Atual</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">
              Oportunidade de Escala Identificada
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {proposal.diagnosis}
            </p>
          </div>
        )}

        {/* 2. Entregáveis & Escopo Detalhado */}
        <div className="rounded-2xl border border-triade-border bg-[#0B1724] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-triade-cyan text-xs font-bold uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            <span>2. Entregáveis & Escopo de Trabalho</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100">
            Tudo o que está incluído no seu projeto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {proposal.scope_items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-triade-border bg-[#0E1C2A] hover:border-triade-cyan/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-triade-cyan/20 text-triade-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Cronograma de Execução */}
        <div className="rounded-2xl border border-triade-border bg-[#0B1724] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-triade-cyan text-xs font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            <span>3. Cronograma Estimado de Execução</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {[
              { etapa: "Etapa 1", tempo: "Semana 1", titulo: "Kickoff & Onboarding", desc: "Coleta de acessos e briefing de público" },
              { etapa: "Etapa 2", tempo: "Semana 2", titulo: "Setup & Produção", desc: "Criação de páginas, criativos e infraestrutura" },
              { etapa: "Etapa 3", tempo: "Semana 3", titulo: "Go-Live / Lançamento", desc: "Aprovação final e publicação oficial" },
              { etapa: "Etapa 4", tempo: "Contínuo", titulo: "Otimização & Escala", desc: "Ajustes de conversão e relatórios semanais" },
            ].map((cron, i) => (
              <div key={i} className="p-4 rounded-xl border border-triade-border bg-[#0E1C2A]">
                <span className="text-[10px] font-bold uppercase text-triade-cyanLight block mb-1">
                  {cron.etapa} • {cron.tempo}
                </span>
                <h4 className="text-xs font-bold text-zinc-100">{cron.titulo}</h4>
                <p className="text-[11px] text-zinc-400 mt-1">{cron.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Investimento & Botão de Aprovação (AUTOMAÇÃO DE FECHAMENTO) */}
        <div className="rounded-3xl border border-triade-cyan/40 bg-gradient-to-b from-[#0E1C2A] to-[#07121A] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-triade-cyanLight">
              4. Proposta de Investimento
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              Pronto para transformar os resultados da {proposal.company_name}?
            </h2>
          </div>

          {/* Grid de Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto my-8">
            {proposal.setup_value > 0 && (
              <div className="p-6 rounded-2xl border border-triade-border bg-[#050B11]/80 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Setup & Estruturação Inicial
                </span>
                <span className="text-3xl font-black text-zinc-100">
                  {formatCurrency(proposal.setup_value)}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Parcelamento em 50/50 (Entrada + Entrega)
                </span>
              </div>
            )}

            {proposal.monthly_value > 0 && (
              <div className="p-6 rounded-2xl border border-triade-cyan/30 bg-triade-cyan/5 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-triade-cyanLight block mb-1">
                  Mensalidade / Gestão Recorrente (MRR)
                </span>
                <span className="text-3xl font-black text-sky-300">
                  {formatCurrency(proposal.monthly_value)}
                  <span className="text-sm font-normal text-zinc-400">/mês</span>
                </span>
                <span className="text-[11px] text-zinc-400 block mt-1">
                  Vencimento mensal após o lançamento
                </span>
              </div>
            )}
          </div>

          {/* CTA de Fechamento */}
          <div className="max-w-md mx-auto text-center space-y-3">
            {!isClosed ? (
              <button
                onClick={handleApproveProposal}
                disabled={isApproving}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-base font-extrabold shadow-blue-glow hover:opacity-95 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Criando sua conta e onboarding...</span>
                  </>
                ) : (
                  <>
                    <span>Aprovar Proposta e Iniciar Onboarding</span>
                    <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10">
                <p className="text-sm font-bold text-emerald-300">
                  ✓ Esta proposta já foi aprovada!
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Seu portal já está criado e o projeto está em andamento.
                </p>
              </div>
            )}

            <p className="text-[11px] text-zinc-400">
              Ao clicar em aprovar, seu acesso ao Portal do Cliente e o Contrato Digital serão liberados imediatamente.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-triade-border/60 py-6 text-center text-xs text-zinc-500">
        Apresentação desenvolvida por <span className="text-triade-cyanLight font-semibold">{workspace.name}</span> • Todos os direitos reservados
      </footer>
    </div>
  );
}
