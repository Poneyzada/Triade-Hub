"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  FolderOpen,
  ExternalLink,
  MessageSquare,
  Shield,
  Layers,
  Globe,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useTriade } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { OnboardingStep, Task } from "@/types/database";

export default function ClientPortalPage() {
  const params = useParams();
  const portalToken = (params?.portal_token as string) || "";
  const {
    getClientByPortalToken,
    getClientSteps,
    getClientTasks,
    completeClientStep,
    isLoaded,
  } = useTriade();

  const [activeTab, setActiveTab] = useState<"onboarding" | "tasks" | "links">("onboarding");
  const [stepInputs, setStepInputs] = useState<Record<string, string>>({});
  const [submittedSteps, setSubmittedSteps] = useState<Record<string, boolean>>({});

  const client = getClientByPortalToken(portalToken);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-triade-gold border-t-transparent" />
          <span className="text-sm font-medium">Carregando seu portal...</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-zinc-100">Portal Não Encontrado</h1>
        <p className="text-sm text-zinc-400 max-w-md mt-2">
          Não localizamos nenhuma conta associada ao token informado. Verifique se o link foi digitado corretamente ou entre em contato com a Tríade Studio.
        </p>
        <div className="mt-6 font-mono text-xs text-zinc-500 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
          Token: {portalToken}
        </div>
      </div>
    );
  }

  const steps = getClientSteps(client.id);
  const tasks = getClientTasks(client.id).filter((t) => t.visible_to_client);

  const completedStepsCount = steps.filter(
    (s) => s.status === "aprovado" || s.status === "enviado_cliente"
  ).length;
  const progressPercent =
    steps.length > 0 ? Math.round((completedStepsCount / steps.length) * 100) : 0;

  const handleInputChange = (stepId: string, val: string) => {
    setStepInputs((prev) => ({ ...prev, [stepId]: val }));
  };

  const handleSubmitStep = (stepId: string) => {
    const text = stepInputs[stepId];
    if (!text || !text.trim()) {
      alert("Por favor, preencha as informações ou cole o link antes de enviar.");
      return;
    }
    completeClientStep(stepId, text.trim());
    setSubmittedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  const getServiceLabel = () => {
    switch (client.service_type) {
      case "trafego":
        return "Gestão de Tráfego & Performance";
      case "site":
        return "Desenvolvimento de Site Institucional";
      case "app":
        return "Desenvolvimento de Aplicativo";
      case "full":
        return "Full-Service • Tráfego + Tecnologia";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center">
      {/* Background Cosmic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06)_0%,transparent_60%)]" />

      {/* Top Header com a Marca da Tríade Studio */}
      <header className="w-full border-b border-triade-border bg-[#0E0F13]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-triade-goldLight via-triade-gold to-triade-goldDark text-black font-extrabold text-sm shadow-gold-glow">
            ▲
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">
                TRÍADE
              </span>
              <span className="text-[10px] font-bold text-triade-gold tracking-widest uppercase">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Portal do Cliente VIP</p>
          </div>
        </div>

        <a
          href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20estou%20no%20Portal%20da%20Tr%C3%ADade%20Studio%20e%20preciso%20de%20ajuda!"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Suporte VIP</span>
        </a>
      </header>

      {/* Hero do Cliente */}
      <main className="w-full max-w-4xl px-4 sm:px-6 py-8 space-y-6 flex-1 z-10">
        {/* Welcome Banner */}
        <div className="rounded-3xl border border-triade-border bg-gradient-to-b from-[#14151B] to-[#101115] p-6 sm:p-8 shadow-card-subtle relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-triade-gold/30 bg-triade-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-triade-goldLight mb-2">
                <Sparkles className="h-3 w-3 text-triade-gold" />
                <span>Espaço Exclusivo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {client.company_name}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Responsável: <span className="text-zinc-200 font-medium">{client.name}</span> • {getServiceLabel()}
              </p>
            </div>

            {/* Pasta do Drive Rápida */}
            {client.access_vault?.drive_folder_url && (
              <a
                href={client.access_vault.drive_folder_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
              >
                <FolderOpen className="h-4 w-4 text-triade-gold" />
                <span>Abrir Google Drive</span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </a>
            )}
          </div>

          {/* Barra de Progresso do Onboarding em Dourado Metálico */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
              <span className="text-zinc-300 flex items-center gap-2">
                <Shield className="h-4 w-4 text-triade-gold" />
                <span>Progresso da Configuração Inicial (Onboarding)</span>
              </span>
              <span className="text-triade-goldLight font-bold text-sm">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-triade-goldLight via-triade-gold to-triade-goldDark transition-all duration-700 shadow-gold-glow"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 mt-2">
              {progressPercent === 100
                ? "🎉 Parabéns! Todos os passos iniciais foram fornecidos com sucesso."
                : `Complete os passos abaixo para que a equipe da Tríade Studio inicie suas campanhas e entregas.`}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-triade-border pb-2 overflow-x-auto">
          {[
            {
              id: "onboarding",
              label: `1. Onboarding & Acessos (${completedStepsCount}/${steps.length})`,
              icon: Sparkles,
            },
            {
              id: "tasks",
              label: `2. Tarefas em Andamento (${tasks.length})`,
              icon: Layers,
            },
            {
              id: "links",
              label: "3. Links do Projeto",
              icon: Globe,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-triade-gold text-black shadow-gold-glow"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ONBOARDING STEPS INTERATIVOS */}
        {activeTab === "onboarding" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Preencha ou anexe as informações solicitadas em cada passo. Nossos especialistas receberão instantaneamente.
            </div>

            <div className="space-y-4">
              {steps.map((step) => {
                const isApproved = step.status === "aprovado";
                const isSubmitted =
                  step.status === "enviado_cliente" || submittedSteps[step.id];

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                      isApproved
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : isSubmitted
                        ? "border-triade-cyan/40 bg-triade-cyan/5"
                        : "border-triade-border bg-[#121215]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold mt-0.5 ${
                            isApproved
                              ? "bg-emerald-500 text-black"
                              : isSubmitted
                              ? "bg-triade-cyan text-black"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {isApproved ? (
                            <Check className="h-4 w-4 stroke-[3]" />
                          ) : (
                            step.order_index
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                          isApproved
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isSubmitted
                            ? "bg-triade-cyan/15 text-triade-cyanLight border border-triade-cyan/30"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {isApproved
                          ? "Concluído ✓"
                          : isSubmitted
                          ? "Em Análise"
                          : "Pendente"}
                      </span>
                    </div>

                    {/* Formulário Interativo do Cliente */}
                    {!isApproved && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/80">
                        {isSubmitted ? (
                          <div className="rounded-xl border border-triade-cyan/30 bg-black/40 p-3">
                            <span className="text-[10px] uppercase font-bold text-triade-cyanLight block mb-1">
                              Informações enviadas para a agência:
                            </span>
                            <p className="text-xs text-zinc-200">
                              {stepInputs[step.id] || step.client_response}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <textarea
                              rows={2}
                              placeholder="Cole o link do Drive, ID da conta, usuário ou digite sua resposta..."
                              value={stepInputs[step.id] ?? (step.client_response || "")}
                              onChange={(e) =>
                                handleInputChange(step.id, e.target.value)
                              }
                              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSubmitStep(step.id)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-triade-goldLight to-triade-gold text-black text-xs font-bold shadow-gold-glow hover:opacity-90 transition-opacity"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>Enviar para a Tríade Studio</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TAREFAS EM ANDAMENTO (VISIBLE_TO_CLIENT = TRUE) */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Acompanhe aqui o andamento operacional de cada entrega da Tríade Studio para a sua empresa.
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 text-[11px] text-zinc-500">
                        <span>Previsão de Entrega:</span>
                        <span className="text-zinc-300 font-medium">
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        task.status === "done"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : task.status === "review"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : task.status === "in_progress"
                          ? "bg-triade-cyan/15 text-triade-cyanLight border border-triade-cyan/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {task.status === "done"
                        ? "Concluído"
                        : task.status === "review"
                        ? "Em Revisão"
                        : task.status === "in_progress"
                        ? "Em Produção"
                        : "Na Fila"}
                    </span>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/50">
                  <Layers className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-400">
                    Nenhuma tarefa com acompanhamento público liberada no momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LINKS ÚTEIS DO PROJETO */}
        {activeTab === "links" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Acesse abaixo os arquivos compartilhados, protótipos de design e painéis de performance.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drive Principal */}
              {client.access_vault?.drive_folder_url && (
                <a
                  href={client.access_vault.drive_folder_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-triade-gold/30 bg-triade-gold/5 p-5 hover:bg-triade-gold/10 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-triade-gold/20 text-triade-gold">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">
                        Google Drive Compartilhado
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Pasta oficial de criativos e arquivos
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-triade-gold" />
                </a>
              )}

              {/* Links Cadastrados */}
              {client.access_vault?.useful_links?.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-triade-border bg-[#121215] p-5 hover:border-triade-cyan/40 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-triade-cyan/15 text-triade-cyanLight">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">
                        {link.title}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {link.category || "Link Externo"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-400" />
                </a>
              ))}
            </div>

            {/* Suporte VIP Card */}
            <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 text-center space-y-3 mt-6">
              <h4 className="text-sm font-bold text-zinc-100">
                Precisa de suporte ou tem alguma dúvida?
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Nosso time de atendimento está à disposição para acelerar o seu projeto.
              </p>
              <a
                href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20falo%20da%20empresa%20"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Falar no WhatsApp da Agência</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer do Portal */}
      <footer className="w-full border-t border-triade-border/60 py-6 text-center text-xs text-zinc-500">
        Desenvolvido com excelência por <span className="text-triade-gold font-semibold">Tríade Studio</span> • Sistema Tríade Flow
      </footer>
    </div>
  );
}
