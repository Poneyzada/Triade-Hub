"use client";

import React, { useState } from "react";
import {
  X,
  Building,
  Key,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  FolderOpen,
  Plus,
  Trash2,
  Globe,
  Layers,
  Sparkles,
  Shield,
  Save,
} from "lucide-react";
import { useTriade } from "@/lib/store";
import { Client, AccessVault, StepStatus, ClientStatus } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "overview" | "vault" | "onboarding" | "tasks";
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
  defaultTab = "overview",
}) => {
  const {
    updateClient,
    updateAccessVault,
    getClientSteps,
    getClientTasks,
    updateOnboardingStep,
  } = useTriade();

  const [activeTab, setActiveTab] = useState<"overview" | "vault" | "onboarding" | "tasks">(
    defaultTab
  );
  const [copiedToken, setCopiedToken] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);

  // Vault form state
  const [bmId, setBmId] = useState("");
  const [googleAds, setGoogleAds] = useState("");
  const [loginRegistroBr, setLoginRegistroBr] = useState("");
  const [loginCloudflare, setLoginCloudflare] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [usefulLinks, setUsefulLinks] = useState<{ id?: string; title: string; url: string; category?: string }[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Populate state when client opens
  React.useEffect(() => {
    if (client) {
      setBmId(client.access_vault?.bm_id || "");
      setGoogleAds(client.access_vault?.google_ads_account || "");
      setLoginRegistroBr(client.access_vault?.login_registro_br || "");
      setLoginCloudflare(client.access_vault?.login_cloudflare || "");
      setDriveUrl(client.access_vault?.drive_folder_url || "");
      setUsefulLinks(client.access_vault?.useful_links || []);
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const steps = getClientSteps(client.id);
  const tasks = getClientTasks(client.id);

  const completedStepsCount = steps.filter(
    (s) => s.status === "aprovado" || s.status === "enviado_cliente"
  ).length;
  const onboardingProgress = steps.length > 0 ? Math.round((completedStepsCount / steps.length) * 100) : 0;

  const handleCopyPortalUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const portalUrl = `${origin}/portal/${client.portal_token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSaveVault = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccessVault(client.id, {
      bm_id: bmId,
      google_ads_account: googleAds,
      login_registro_br: loginRegistroBr,
      login_cloudflare: loginCloudflare,
      drive_folder_url: driveUrl,
      useful_links: usefulLinks,
    });
    setVaultSaved(true);
    setTimeout(() => setVaultSaved(false), 2500);
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setUsefulLinks([
      ...usefulLinks,
      {
        id: `link-${Date.now()}`,
        title: newLinkTitle.trim(),
        url: newLinkUrl.trim().startsWith("http") ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
        category: "Geral",
      },
    ]);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleRemoveLink = (index: number) => {
    setUsefulLinks(usefulLinks.filter((_, i) => i !== index));
  };

  const handleStatusChange = (newStatus: ClientStatus) => {
    updateClient(client.id, { status: newStatus });
  };

  const getServiceBadge = () => {
    switch (client.service_type) {
      case "trafego":
        return { label: "Gestão de Tráfego", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
      case "site":
        return { label: "Site Institucional", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      case "app":
        return { label: "Aplicativo Mobile", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" };
      case "full":
        return { label: "Full-Service Tríade", color: "bg-triade-cyan/15 text-triade-cyanLight border-triade-cyan/30" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-triade-border bg-[#0B1724] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-triade-border bg-[#07111A]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-600 text-black font-extrabold text-lg shadow-blue-glow">
              {client.company_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-zinc-100">
                  {client.company_name}
                </h2>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    getServiceBadge().color
                  }`}
                >
                  {getServiceBadge().label}
                </span>
              </div>
              <p className="text-xs text-zinc-200 mt-0.5">
                Contato: <span className="text-zinc-200 font-medium">{client.name}</span> • {client.email} • {client.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-triade-border bg-[#09141F] px-6 gap-2">
          {[
            { id: "overview", label: "Visão Geral", icon: Building },
            { id: "vault", label: "Cofre de Acessos", icon: Key },
            {
              id: "onboarding",
              label: `Onboarding (${completedStepsCount}/${steps.length})`,
              icon: Sparkles,
            },
            {
              id: "tasks",
              label: `Tarefas (${tasks.length})`,
              icon: Layers,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                  isActive
                    ? "border-triade-blue text-triade-blueLight bg-triade-blue/10"
                    : "border-transparent text-zinc-200 hover:text-zinc-200 hover:bg-[#0D1C2A]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Portal Público Callout Banner */}
              <div className="rounded-2xl border border-triade-blue/30 bg-gradient-to-r from-triade-blue/15 via-[#0D1D2B] to-[#08121A] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-triade-blueLight text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="h-4 w-4 text-triade-blue" />
                    <span>Link Exclusivo do Portal do Cliente</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    O cliente acessa sem login por este token e visualiza o onboarding, tarefas públicas e links úteis.
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-cyan-300/80 bg-black/40 px-2.5 py-1 rounded inline-block">
                    /portal/{client.portal_token}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyPortalUrl}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-triade-blue/40 bg-triade-blue/10 text-triade-blueLight text-xs font-semibold hover:bg-triade-blue/20 transition-colors"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`/portal/${client.portal_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs font-bold shadow-blue-glow hover:opacity-90 transition-opacity"
                  >
                    <span>Abrir Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Grid de Métricas do Cliente */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="rounded-xl border border-triade-border bg-zinc-900/50 p-4">
                  <span className="text-[10px] uppercase font-semibold text-zinc-200 block mb-1">
                    Mensalidade (MRR)
                  </span>
                  <span className="text-lg font-bold text-sky-300">
                    {formatCurrency(client.monthly_fee)}
                  </span>
                </div>
                <div className="rounded-xl border border-triade-border bg-zinc-900/50 p-4">
                  <span className="text-[10px] uppercase font-semibold text-zinc-200 block mb-1">
                    Valor Contratado
                  </span>
                  <span className="text-lg font-bold text-zinc-100">
                    {formatCurrency(client.contract_value)}
                  </span>
                </div>
                <div className="rounded-xl border border-triade-border bg-zinc-900/50 p-4">
                  <span className="text-[10px] uppercase font-semibold text-zinc-200 block mb-1">
                    Progresso Onboarding
                  </span>
                  <span className="text-lg font-bold text-triade-cyanLight">
                    {onboardingProgress}%
                  </span>
                </div>
                <div className="rounded-xl border border-triade-border bg-zinc-900/50 p-4">
                  <span className="text-[10px] uppercase font-semibold text-zinc-200 block mb-1">
                    Status da Conta
                  </span>
                  <select
                    value={client.status}
                    onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
                    className="w-full text-xs font-bold rounded-lg border border-triade-border bg-zinc-800 px-2 py-1 text-zinc-100 focus:outline-none"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Informações Complementares */}
              <div className="rounded-xl border border-triade-border bg-zinc-900/30 p-5">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
                  Observações e Alinhamento
                </h3>
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {client.notes || "Nenhuma observação interna cadastrada para este cliente."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COFRE DE ACESSOS */}
          {activeTab === "vault" && (
            <form onSubmit={handleSaveVault} className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-triade-border">
                <div className="flex items-center gap-2 text-triade-cyan">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-zinc-100">
                    Cofre Seguro de Acessos & Credenciais
                  </h3>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs font-bold shadow-blue-glow hover:opacity-95 transition-opacity"
                >
                  {vaultSaved ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Salvo com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar Cofre</span>
                    </>
                  )}
                </button>
              </div>

              {/* Campos do Cofre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Business Manager (BM ID - Meta Ads)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BM-889102938"
                    value={bmId}
                    onChange={(e) => setBmId(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Conta Google Ads (ID de 10 dígitos)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 892-120-4491"
                    value={googleAds}
                    onChange={(e) => setGoogleAds(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Login / Usuário Registro.br
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: usuario.adm / Senha..."
                    value={loginRegistroBr}
                    onChange={(e) => setLoginRegistroBr(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Login Cloudflare / DNS
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: dns@cliente.com.br"
                    value={loginCloudflare}
                    onChange={(e) => setLoginCloudflare(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Link da Pasta do Google Drive (Arquivos & Criativos)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
                  />
                  {driveUrl && (
                    <a
                      href={driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
                    >
                      <FolderOpen className="h-4 w-4 text-triade-cyanLight" />
                      <span>Abrir</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Links Úteis do Projeto */}
              <div className="pt-4 border-t border-triade-border">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Links Úteis & Ferramentas do Cliente (Figma, Dashboards, Homologação)
                </label>

                {/* Lista de links */}
                <div className="space-y-2 mb-3">
                  {usefulLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-triade-border bg-zinc-900/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="h-4 w-4 text-triade-cyan flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-zinc-200">{link.title}</p>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-zinc-200 hover:text-triade-cyanLight truncate block"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-zinc-200 hover:text-zinc-100 hover:bg-zinc-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {usefulLinks.length === 0 && (
                    <p className="text-xs text-zinc-300 italic py-2">
                      Nenhum link adicional cadastrado ainda.
                    </p>
                  )}
                </div>

                {/* Adicionar novo link */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Título (ex: Figma Protótipo)"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="sm:col-span-2 rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="URL (ex: figma.com/...)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="sm:col-span-2 rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium py-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: MOTOR DE ONBOARDING */}
          {activeTab === "onboarding" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-triade-border">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Passos do Motor de Onboarding Dinâmico
                  </h3>
                  <p className="text-xs text-zinc-200">
                    Gerados com base no serviço ({client.service_type.toUpperCase()}).
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-triade-cyan/30 bg-triade-cyan/10 text-triade-cyanLight">
                  {completedStepsCount} de {steps.length} concluídos ({onboardingProgress}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${onboardingProgress}%` }}
                />
              </div>

              {/* Steps list */}
              <div className="space-y-3 pt-2">
                {steps.map((step) => {
                  const isDone = step.status === "aprovado";
                  const isSubmitted = step.status === "enviado_cliente";

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isSubmitted
                          ? "border-triade-cyan/40 bg-triade-cyan/5"
                          : "border-triade-border bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold mt-0.5 ${
                              isDone
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isSubmitted
                                ? "bg-triade-cyan/20 text-triade-cyanLight border border-triade-cyan/40"
                                : "bg-zinc-800 text-zinc-200"
                            }`}
                          >
                            {step.order_index}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-100">
                              {step.title}
                            </h4>
                            <p className="text-xs text-zinc-200 mt-0.5">
                              {step.description}
                            </p>

                            {/* Resposta enviada pelo cliente */}
                            {step.client_response ? (
                              <div className="mt-2 rounded-lg border border-zinc-700/60 bg-black/40 p-2.5">
                                <span className="text-[10px] uppercase font-bold text-triade-cyanLight block mb-1">
                                  Resposta enviada pelo Cliente:
                                </span>
                                <p className="text-xs text-zinc-200">
                                  {step.client_response}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-zinc-300 italic mt-1.5">
                                Aguardando envio de dados pelo cliente no portal.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status selector & Actions */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <select
                            value={step.status}
                            onChange={(e) =>
                              updateOnboardingStep(step.id, {
                                status: e.target.value as StepStatus,
                                completed_at:
                                  e.target.value === "aprovado"
                                    ? new Date().toISOString()
                                    : step.completed_at,
                              })
                            }
                            className={`text-xs font-semibold rounded-lg px-2 py-1 border bg-zinc-900 focus:outline-none ${
                              isDone
                                ? "text-emerald-400 border-emerald-500/40"
                                : isSubmitted
                                ? "text-triade-cyanLight border-triade-cyan/40"
                                : "text-amber-400 border-amber-500/30"
                            }`}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="enviado_cliente">Enviado p/ Cliente</option>
                            <option value="aprovado">Aprovado ✓</option>
                          </select>

                          {isSubmitted && (
                            <button
                              type="button"
                              onClick={() =>
                                updateOnboardingStep(step.id, {
                                  status: "aprovado",
                                  completed_at: new Date().toISOString(),
                                })
                              }
                              className="text-[11px] font-semibold text-emerald-400 hover:underline"
                            >
                              Aprovar Agora
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TAREFAS DO CLIENTE */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-triade-border">
                <h3 className="text-sm font-bold text-zinc-100">
                  Tarefas Operacionais de {client.company_name}
                </h3>
                <span className="text-xs text-zinc-200">
                  Total de {tasks.length} tarefas vinculadas
                </span>
              </div>

              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-triade-border bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          task.status === "done"
                            ? "bg-emerald-400"
                            : task.status === "review"
                            ? "bg-purple-400"
                            : task.status === "in_progress"
                            ? "bg-triade-cyan"
                            : "bg-zinc-600"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-200">
                            Prazo: {formatDate(task.deadline)}
                          </span>
                          {task.visible_to_client && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border border-triade-cyan/30 bg-triade-cyan/10 text-triade-cyanLight">
                              Visível no Portal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium uppercase text-zinc-200">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <p className="text-xs text-zinc-300 italic text-center py-6">
                    Nenhuma tarefa criada para este cliente ainda.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
