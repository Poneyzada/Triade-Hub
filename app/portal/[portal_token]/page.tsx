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
  FileText,
  CreditCard,
  QrCode,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Lock,
  XCircle,
} from "lucide-react";
import { useTriade } from "@/lib/store";
import { formatDate, formatCurrency } from "@/lib/utils";
import { OnboardingStep, Task, Approval, Invoice, Contract } from "@/types/database";

export default function ClientPortalPage() {
  const params = useParams();
  const portalToken = (params?.portal_token as string) || "";
  const {
    getClientByPortalToken,
    getClientSteps,
    getClientTasks,
    getClientApprovals,
    getClientInvoices,
    getClientContract,
    completeClientStep,
    reviewApproval,
    signContract,
    workspace,
    isLoaded,
  } = useTriade();

  const [activeTab, setActiveTab] = useState<
    "onboarding" | "tasks" | "approvals" | "invoices" | "contract" | "links"
  >("onboarding");

  // Step inputs
  const [stepInputs, setStepInputs] = useState<Record<string, string>>({});
  const [submittedSteps, setSubmittedSteps] = useState<Record<string, boolean>>({});

  // Approval feedbacks
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  // PIX Modal
  const [selectedPixInvoice, setSelectedPixInvoice] = useState<Invoice | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Contract Signature Modal / State
  const [signerName, setSignerName] = useState("");
  const [signerDoc, setSignerDoc] = useState("");
  const [signedSuccess, setSignedSuccess] = useState(false);

  const client = getClientByPortalToken(portalToken);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-triade-gold border-t-transparent" />
          <span className="text-sm font-medium">Carregando seu portal VIP...</span>
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
          Não localizamos nenhuma conta associada ao token informado. Verifique se o link foi digitado corretamente.
        </p>
      </div>
    );
  }

  const steps = getClientSteps(client.id);
  const tasks = getClientTasks(client.id).filter((t) => t.visible_to_client);
  const approvals = getClientApprovals(client.id);
  const invoices = getClientInvoices(client.id);
  const contract = getClientContract(client.id);

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
      alert("Por favor, preencha as informações antes de enviar.");
      return;
    }
    completeClientStep(stepId, text.trim());
    setSubmittedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  const handleApprove = (approvalId: string) => {
    reviewApproval(approvalId, "aprovado");
    alert("✓ Entrega aprovada com sucesso! Nossa equipe foi notificada.");
  };

  const handleSubmitAdjustment = (approvalId: string) => {
    const text = feedbackInputs[approvalId];
    if (!text || !text.trim()) {
      alert("Por favor, descreva as alterações desejadas.");
      return;
    }
    reviewApproval(approvalId, "solicitado_ajustes", text.trim());
    setEditingFeedbackId(null);
    alert("Feedback registrado! Faremos as alterações solicitadas com prioridade.");
  };

  const handleCopyPix = (pix: string) => {
    navigator.clipboard.writeText(pix);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSignContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !signerName.trim() || !signerDoc.trim()) {
      alert("Preencha seu Nome Completo e CPF/CNPJ para assinar.");
      return;
    }
    signContract(contract.id, signerName.trim(), signerDoc.trim());
    setSignedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06)_0%,transparent_60%)]" />

      {/* Top Header */}
      <header className="w-full border-b border-triade-border bg-[#0E0F13]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-triade-goldLight via-triade-gold to-triade-goldDark text-black font-extrabold text-sm shadow-gold-glow">
            ▲
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">
                {workspace.name}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Portal do Cliente VIP</p>
          </div>
        </div>

        <a
          href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20estou%20no%20meu%20Portal%20e%20gostaria%20de%20um%20suporte."
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
                <span>Espaço VIP • {workspace.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {client.company_name}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Responsável: <span className="text-zinc-200 font-medium">{client.name}</span> • Serviço: {client.service_type.toUpperCase()}
              </p>
            </div>

            {client.access_vault?.drive_folder_url && (
              <a
                href={client.access_vault.drive_folder_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
              >
                <FolderOpen className="h-4 w-4 text-triade-gold" />
                <span>Google Drive</span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </a>
            )}
          </div>

          {/* Barra de Progresso do Onboarding */}
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
          </div>
        </div>

        {/* Tab Selector (Todas as 6 abas do sistema completo) */}
        <div className="flex items-center gap-1.5 border-b border-triade-border pb-2 overflow-x-auto">
          {[
            { id: "onboarding", label: `Onboarding (${completedStepsCount}/${steps.length})`, icon: Sparkles },
            { id: "approvals", label: `Aprovações (${approvals.length})`, icon: CheckCircle2, badge: approvals.filter((a) => a.status === "pendente").length },
            { id: "invoices", label: `Faturas (${invoices.length})`, icon: CreditCard },
            { id: "contract", label: "Contrato Digital", icon: FileText, signed: contract?.status === "assinado" },
            { id: "tasks", label: `Tarefas (${tasks.length})`, icon: Layers },
            { id: "links", label: "Links & Arquivos", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-triade-gold text-black shadow-gold-glow"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-extrabold">
                    {tab.badge}
                  </span>
                )}
                {tab.signed && (
                  <span className="text-[10px] text-emerald-400">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ONBOARDING */}
        {activeTab === "onboarding" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Preencha ou anexe os dados solicitados. A equipe da {workspace.name} receberá e analisará em tempo real.
            </div>

            <div className="space-y-4">
              {steps.map((step) => {
                const isApproved = step.status === "aprovado";
                const isSubmitted = step.status === "enviado_cliente" || submittedSteps[step.id];

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      isApproved
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : isSubmitted
                        ? "border-triade-cyan/40 bg-triade-cyan/5"
                        : "border-triade-border bg-[#121215]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold mt-0.5 ${
                            isApproved
                              ? "bg-emerald-500 text-black"
                              : isSubmitted
                              ? "bg-triade-cyan text-black"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {isApproved ? <Check className="h-4 w-4 stroke-[3]" /> : step.order_index}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100">{step.title}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{step.description}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isApproved
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isSubmitted
                            ? "bg-triade-cyan/15 text-triade-cyanLight border border-triade-cyan/30"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {isApproved ? "Concluído ✓" : isSubmitted ? "Em Análise" : "Pendente"}
                      </span>
                    </div>

                    {!isApproved && (
                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        {isSubmitted ? (
                          <div className="rounded-xl border border-triade-cyan/30 bg-black/40 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-triade-cyanLight block mb-0.5">
                              Dados enviados com sucesso:
                            </span>
                            <p className="text-xs text-zinc-200">{stepInputs[step.id] || step.client_response}</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <textarea
                              rows={2}
                              placeholder="Cole o link do Drive, ID da conta, usuário ou digite sua resposta..."
                              value={stepInputs[step.id] ?? (step.client_response || "")}
                              onChange={(e) => handleInputChange(step.id, e.target.value)}
                              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSubmitStep(step.id)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-triade-goldLight to-triade-gold text-black text-xs font-bold shadow-gold-glow hover:opacity-90"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>Enviar para a Agência</span>
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

        {/* TAB 2: CENTRAL DE APROVAÇÕES (FASE 2) */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Revise os materiais criados pela nossa equipe. Clique em <b>Aprovar</b> para prosseguir ou solicite ajustes com observações.
            </div>

            <div className="space-y-4">
              {approvals.map((appr) => {
                const isApproved = appr.status === "aprovado";
                const isEditing = editingFeedbackId === appr.id;

                return (
                  <div
                    key={appr.id}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                      isApproved
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : appr.status === "solicitado_ajustes"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-triade-border bg-[#121215]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {appr.type.replace("_", " ")}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            Postado em {formatDate(appr.created_at)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-100">{appr.title}</h3>
                        <p className="text-xs text-zinc-400 mt-1">{appr.description}</p>
                      </div>

                      <span
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full border self-start ${
                          isApproved
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : appr.status === "solicitado_ajustes"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {isApproved ? "✓ Aprovado" : appr.status === "solicitado_ajustes" ? "Ajustes Solicitados" : "Aguardando Sua Aprovação"}
                      </span>
                    </div>

                    {/* Preview da Imagem */}
                    {appr.media_url && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-zinc-800 max-h-72">
                        <img src={appr.media_url} alt={appr.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Copy Text */}
                    {appr.copy_text && (
                      <div className="mt-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Texto / Copy Proposta:
                        </span>
                        <p className="text-xs text-zinc-200 italic whitespace-pre-wrap leading-relaxed">
                          "{appr.copy_text}"
                        </p>
                      </div>
                    )}

                    {/* Feedback existente */}
                    {appr.client_feedback && (
                      <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                        <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">
                          Sua Solicitação de Ajuste:
                        </span>
                        <p className="text-xs text-zinc-200">{appr.client_feedback}</p>
                      </div>
                    )}

                    {/* Botões de Ação do Cliente */}
                    {!isApproved && (
                      <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                        <a
                          href={appr.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Abrir Link Externo (Figma / Staging)</span>
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFeedbackId(isEditing ? null : appr.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-colors"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span>Solicitar Ajuste</span>
                          </button>

                          <button
                            onClick={() => handleApprove(appr.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>Aprovar Entrega ✓</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Caixa de Texto para Solicitar Ajuste */}
                    {isEditing && (
                      <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-black/60 space-y-2">
                        <label className="block text-xs font-bold text-amber-300">
                          O que você gostaria de ajustar neste material?
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Trocar a cor da chamada, alterar o texto da frase final..."
                          value={feedbackInputs[appr.id] || ""}
                          onChange={(e) =>
                            setFeedbackInputs({ ...feedbackInputs, [appr.id]: e.target.value })
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-xs text-zinc-100 focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFeedbackId(null)}
                            className="px-3 py-1.5 text-xs text-zinc-400"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitAdjustment(appr.id)}
                            className="px-4 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold"
                          >
                            Enviar Ajuste
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {approvals.length === 0 && (
                <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/50">
                  <CheckCircle2 className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-400">
                    Nenhum material aguardando aprovação no momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FATURAS & PAGAMENTOS (FASE 3) */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Acesse suas faturas, comprovantes e efetue o pagamento instantâneo via PIX ou Boleto/Cartão.
            </div>

            <div className="space-y-3">
              {invoices.map((inv) => {
                const isPaid = inv.status === "pago";

                return (
                  <div
                    key={inv.id}
                    className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isPaid
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-triade-border bg-[#121215]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {inv.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Vencimento: <strong className="text-zinc-200">{formatDate(inv.due_date)}</strong>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-100">{inv.title}</h4>
                      <p className="text-lg font-black text-triade-goldLight mt-1">
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isPaid ? "✓ Pago" : "Aguardando Pagamento"}
                      </span>

                      {!isPaid && (
                        <button
                          onClick={() => setSelectedPixInvoice(inv)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-triade-goldLight to-triade-gold text-black text-xs font-bold shadow-gold-glow hover:opacity-95 transition-opacity"
                        >
                          <QrCode className="h-4 w-4" />
                          <span>Pagar via PIX</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {invoices.length === 0 && (
                <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/50">
                  <CreditCard className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-400">
                    Nenhuma fatura emitida até o momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CONTRATO DIGITAL */}
        {activeTab === "contract" && (
          <div className="space-y-4">
            {contract ? (
              <div className="rounded-2xl border border-triade-border bg-[#121215] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-triade-border">
                  <div className="flex items-center gap-2 text-triade-gold font-bold text-sm">
                    <FileText className="h-5 w-5" />
                    <span>{contract.title}</span>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                      contract.status === "assinado"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {contract.status === "assinado" ? "✓ Contrato Assinado" : "Aguardando Assinatura"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {contract.content}
                </div>

                {contract.status === "assinado" ? (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Documento assinado digitalmente com validade jurídica</span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Signatário: {contract.signer_name} (Documento: {contract.signer_document}) em {formatDate(contract.signed_at)}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignContract} className="pt-3 border-t border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-zinc-200 block">
                      Aceite e Assinatura Digital do Contrato:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nome Completo do Representante"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="CPF ou CNPJ do Titular"
                        value={signerDoc}
                        onChange={(e) => setSignerDoc(e.target.value)}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-triade-goldLight to-triade-gold text-black text-xs font-extrabold shadow-gold-glow hover:opacity-95"
                    >
                      Assinar Contrato Digitalmente
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic text-center py-10">
                Nenhum contrato gerado para este cliente ainda.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: TAREFAS */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              Acompanhamento operacional em tempo real de cada entrega da equipe.
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-zinc-400 mt-1">{task.description}</p>
                      )}
                      <span className="text-[11px] text-zinc-500 block mt-2">
                        Previsão: {formatDate(task.deadline)}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-triade-cyan/15 text-triade-cyanLight border border-triade-cyan/30">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LINKS & ARQUIVOS */}
        {activeTab === "links" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <h4 className="text-sm font-bold text-zinc-100">Pasta Oficial no Google Drive</h4>
                      <p className="text-xs text-zinc-400">Acesse vídeos, fotos e documentos</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-triade-gold" />
                </a>
              )}

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
                      <h4 className="text-sm font-bold text-zinc-100">{link.title}</h4>
                      <p className="text-xs text-zinc-400">{link.category || "Link"}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal PIX Copia e Cola / QR Code */}
      {selectedPixInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPixInvoice(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-triade-border bg-[#121215] p-6 shadow-2xl z-10 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-triade-border">
              <h3 className="text-sm font-bold text-zinc-100">Pagamento via PIX Instantâneo</h3>
              <button onClick={() => setSelectedPixInvoice(null)} className="text-zinc-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white text-black inline-block mx-auto shadow-md">
              <QrCode className="h-32 w-32 mx-auto" />
              <span className="text-[10px] text-zinc-700 font-mono block mt-1">Escaneie pelo app do seu banco</span>
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-200">{selectedPixInvoice.title}</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">
                {formatCurrency(selectedPixInvoice.amount)}
              </p>
            </div>

            <div className="space-y-2 text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Código PIX Copia e Cola:
              </span>
              <div className="p-2.5 rounded-lg border border-zinc-800 bg-black/60 font-mono text-[11px] text-zinc-300 break-all select-all max-h-20 overflow-y-auto">
                {selectedPixInvoice.pix_copy_paste}
              </div>
              <button
                onClick={() => handleCopyPix(selectedPixInvoice.pix_copy_paste!)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedPix ? "Código Copiado!" : "Copiar Código PIX"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full border-t border-triade-border/60 py-6 text-center text-xs text-zinc-500">
        Desenvolvido por <span className="text-triade-gold font-semibold">{workspace.name}</span> • Sistema Tríade Flow
      </footer>
    </div>
  );
}
