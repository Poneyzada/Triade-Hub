"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Plus,
  Eye,
  Shield,
  Users,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ClientDetailModal } from "@/components/clients/ClientDetailModal";
import { Client } from "@/types/database";
import { AsciiArt } from "@/components/ui/sss";

export default function DashboardPage() {
  const { clients, tasks, approvals, metrics, getClientSteps } = useTriade();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Card com ASCII Art Animado */}
        <div className="relative rounded-3xl border border-triade-cyan/30 bg-[#07121A] p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Fundo ASCII Art Animado */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none filter saturate-200 hue-rotate-[185deg]">
            <AsciiArt className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B11]/95 via-[#050B11]/75 to-[#050B11]/30 pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Tríade Hub • Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Visão Geral Operacional & Financeira
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Gestão all-in-one para a Tríade Studio: MRR recorrente, CRM de leads qualificados por IA, contratos e faturamento.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link
              href="/crm"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs font-bold shadow-blue-glow hover:opacity-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ver CRM & Leads IA</span>
            </Link>

            <Link
              href="/clientes"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-triade-border bg-[#0E1C2A]/90 hover:border-triade-cyan/50 text-xs font-semibold text-zinc-200 transition-colors backdrop-blur-sm"
            >
              <Users className="h-4 w-4 text-triade-cyan" />
              <span>Clientes Ativos</span>
            </Link>
          </div>
        </div>

        {/* 5 CARDS EXECUTIVOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: MRR Ativo */}
          <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle relative overflow-hidden group hover:border-triade-blue/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                MRR Ativo
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-triade-blue/15 text-triade-blue border border-triade-blue/30">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-triade-blueLight tracking-tight">
              {formatCurrency(metrics.activeMRR)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Receita Recorrente Mensal</span>
            </div>
            <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-triade-blue/10 blur-xl group-hover:bg-triade-blue/20 transition-colors" />
          </div>

          {/* Card 2: Projetos em Andamento */}
          <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                Projetos Ativos
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white tracking-tight">
              {metrics.ongoingProjectsCount}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
              <span>Tarefas em fluxo operacional</span>
            </div>
          </div>

          {/* Card 3: Onboardings Pendentes */}
          <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                Onboardings
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-cyan-300 tracking-tight">
              {metrics.pendingOnboardingsCount}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>Contas aguardando dados</span>
            </div>
          </div>

          {/* Card 4: Aprovações Aguardando Cliente */}
          <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                Aprovações
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-cyan-300 tracking-tight">
              {metrics.pendingApprovalsCount}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
              <span>Artes & páginas na fila</span>
            </div>
          </div>

          {/* Card 5: Faturamento do Mês */}
          <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                Faturamento Mês
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(metrics.monthRevenue)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
              <span>MRR + Entradas 50/50</span>
            </div>
          </div>
        </div>

        {/* SEÇÃO PRINCIPAL: RADAR DE ONBOARDINGS & KANBAN STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1 e 2: Radar de Onboardings dos Clientes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-triade-blue" />
                  <span>Radar de Onboarding Dinâmico</span>
                </h2>
                <p className="text-xs text-zinc-300 font-medium">
                  Progresso de coleta de acessos e materiais em tempo real
                </p>
              </div>
              <Link
                href="/clientes"
                className="text-xs text-triade-cyanLight hover:underline font-bold"
              >
                Gerenciar Todos →
              </Link>
            </div>

            <div className="space-y-3">
              {clients.map((c) => {
                const steps = getClientSteps(c.id);
                const completed = steps.filter(
                  (s) => s.status === "aprovado" || s.status === "enviado_cliente"
                ).length;
                const percent =
                  steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 hover:border-triade-blue/40 transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-black font-extrabold text-sm shadow-blue-glow">
                          {c.company_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-100">
                              {c.company_name}
                            </h3>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300">
                              {c.service_type}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 font-medium mt-0.5">
                            Contato: <span className="text-white font-semibold">{c.name}</span> • Mensalidade:{" "}
                            <span className="text-triade-cyanLight font-bold">
                              {formatCurrency(c.monthly_fee)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Ações Rápidas */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedClient(c)}
                          className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-[#0A1622] hover:bg-[#122332] text-xs font-semibold text-zinc-200 transition-colors"
                        >
                          Cofre & Detalhes
                        </button>
                        <a
                          href={`/portal/${c.portal_token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-triade-blue/30 bg-triade-blue/10 hover:bg-triade-blue/20 text-xs font-semibold text-triade-blueLight transition-colors"
                        >
                          <span>Portal</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Barra de Progresso do Onboarding */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-200 font-medium">
                          Passos Coletados ({completed}/{steps.length})
                        </span>
                        <span
                          className={`font-bold ${
                            percent === 100
                              ? "text-emerald-400"
                              : "text-triade-blueLight"
                          }`}
                        >
                          {percent}% Concluído
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 transition-all duration-500 shadow-blue-glow"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna 3: Tarefas Críticas & Aprovações */}
          <div className="space-y-6">
            {/* Tarefas Operacionais em Destaque */}
            <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-triade-border mb-4">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
                  <Layers className="h-4 w-4 text-triade-blue" />
                  <span>Entregas Prioritárias</span>
                </div>
                <Link
                  href="/projetos"
                  className="text-xs text-triade-blue hover:underline font-medium"
                >
                  Kanban →
                </Link>
              </div>

              <div className="space-y-3">
                {tasks.slice(0, 4).map((task) => {
                  const client = clients.find((c) => c.id === task.client_id);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-triade-border bg-[#091520] hover:border-triade-blue/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                          {task.title}
                        </p>
                        {task.visible_to_client && (
                          <span
                            title="Visível no Portal do Cliente"
                            className="flex items-center gap-1 text-[9px] font-bold text-triade-blue px-1.5 py-0.5 rounded bg-triade-blue/10 border border-triade-blue/30 flex-shrink-0"
                          >
                            <Eye className="h-2.5 w-2.5" />
                            <span>Portal</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                        <span className="truncate max-w-[150px]">
                          {client?.company_name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-medium ${
                            task.priority === "urgente"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : task.priority === "alta"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fila de Aprovações */}
            <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-5 shadow-card-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-triade-border mb-4">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Aprovações de Criativos</span>
                </div>
                <Link
                  href="/aprovacoes"
                  className="text-xs text-cyan-400 hover:underline font-medium"
                >
                  Fila →
                </Link>
              </div>

              <div className="space-y-3">
                {approvals.map((appr) => {
                  const client = clients.find((c) => c.id === appr.client_id);
                  return (
                    <div
                      key={appr.id}
                      className="p-3 rounded-xl border border-triade-border bg-[#091520]"
                    >
                      <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                        {appr.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                        <span>{client?.company_name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            appr.status === "aprovado"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : appr.status === "solicitado_ajustes"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {appr.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Cliente */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </AppShell>
  );
}
