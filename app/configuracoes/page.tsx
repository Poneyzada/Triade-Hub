"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Building2,
  Palette,
  Globe,
  Key,
  MessageSquare,
  Sparkles,
  Save,
  Check,
  Plus,
  Send,
  CreditCard,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { NewWorkspaceModal } from "@/components/workspaces/NewWorkspaceModal";

export default function ConfiguracoesPage() {
  const { workspace, workspaces, updateWorkspace, switchWorkspace, notifyClientWhatsApp, clients } = useTriade();

  const [agencyName, setAgencyName] = useState(workspace.name);
  const [agencySlug, setAgencySlug] = useState(workspace.slug);
  const [primaryColor, setPrimaryColor] = useState(workspace.primary_color);
  const [logoUrl, setLogoUrl] = useState(workspace.logo_url || "");
  const [webhookUrl, setWebhookUrl] = useState(workspace.whatsapp_webhook_url || "");
  const [paymentKey, setPaymentKey] = useState(workspace.payment_api_key || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);

  // Test WhatsApp Trigger
  const [testPhone, setTestPhone] = useState("(11) 98765-4321");
  const [testTrigger, setTestTrigger] = useState<"welcome" | "approval" | "onboarding" | "invoice">("welcome");
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspace({
      name: agencyName,
      slug: agencySlug,
      primary_color: primaryColor,
      logo_url: logoUrl,
      whatsapp_webhook_url: webhookUrl,
      payment_api_key: paymentKey,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRunTestWhatsApp = async () => {
    const client = clients[0];
    const res = await notifyClientWhatsApp({
      phone: testPhone,
      trigger: testTrigger,
      data: {
        clientName: client?.name || "Dr. Felipe Mendes",
        companyName: client?.company_name || "Nexus Odontologia",
        itemTitle: "Carrossel de Anúncios Meta Ads",
        stepTitle: "Acesso ao Business Manager (Meta Ads)",
        invoiceTitle: "Mensalidade Gestão de Tráfego",
        amount: "R$ 3.500,00",
        dueDate: "10/11/2026",
        pixCode: "00020126580014BR.GOV.BCB.PIX...",
        portalToken: client?.portal_token || "nexus-odonto-7k29a",
      },
    });

    setTestResult(res.fallbackUrl);
    window.open(res.fallbackUrl, "_blank");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-cyan text-xs font-bold uppercase tracking-wider mb-1">
              <Settings className="h-4 w-4" />
              <span>Configurações & Administração SaaS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              White-Label, Multi-Tenancy & Automações
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Personalize sua agência, configure webhooks do WhatsApp e gerencie múltiplos workspaces parceiros.
            </p>
          </div>

          <button
            onClick={() => setIsNewWsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-triade-cyan/30 bg-triade-cyan/10 hover:bg-triade-cyan/20 text-triade-cyanLight text-xs sm:text-sm font-bold transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Agência Parceira</span>
          </button>
        </div>

        {/* Workspaces Ativos / Seletor */}
        <div className="p-4 rounded-2xl border border-triade-border bg-[#0E1C2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Workspaces Multi-Tenant Registrados ({workspaces.length})
            </span>
            <p className="text-sm font-bold text-zinc-100">
              Workspace Ativo: <span className="text-triade-cyanLight">{workspace.name}</span> ({workspace.slug})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  ws.id === workspace.id
                    ? "border-triade-cyan bg-triade-cyan/15 text-triade-cyanLight shadow-sm"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {ws.name}
              </button>
            ))}
          </div>
        </div>

        {/* Formulário Principal de Configurações */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco 1: Identidade Visual White-Label */}
            <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-6 shadow-card-subtle space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-triade-border">
                <div className="h-9 w-9 rounded-xl bg-triade-cyan/20 text-triade-cyanLight flex items-center justify-center">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Identidade Visual da Agência (White-Label)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Será exibida no Portal do Cliente e Propostas Públicas
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Nome Oficial da Agência
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Slug / Subdomínio
                  </label>
                  <input
                    type="text"
                    required
                    value={agencySlug}
                    onChange={(e) => setAgencySlug(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Cor Primária de Destaque (Hex)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 rounded-xl border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-xs font-mono text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    URL da Logo (PNG transparente / SVG)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Automações e Webhooks WhatsApp & Pagamentos */}
            <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-6 shadow-card-subtle space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-triade-border">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Central de Automações & Webhooks
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Evolution API, Z-API, Asaas e AbacatePay
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    URL do Webhook WhatsApp (Evolution API / Z-API)
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.evolution.suaagencia.com/message/sendText/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-xs text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Caso não informado, o sistema utilizará o link direto <code>wa.me</code> com 1 clique.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Chave de API de Pagamentos (Asaas / AbacatePay)
                  </label>
                  <input
                    type="password"
                    placeholder="live_key_..."
                    value={paymentKey}
                    onChange={(e) => setPaymentKey(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-xs text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Endpoint de Webhook pronto em: <code>/api/webhooks/payment</code>
                  </span>
                </div>

                {/* Testador dos 4 Gatilhos */}
                <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    <span>Testar Gatilho de Disparo WhatsApp:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />

                    <select
                      value={testTrigger}
                      onChange={(e) => setTestTrigger(e.target.value as any)}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    >
                      <option value="welcome">A: Boas-vindas Onboarding</option>
                      <option value="approval">B: Novo Item para Aprovar</option>
                      <option value="onboarding">C: Lembrete de Acessos</option>
                      <option value="invoice">D: Lembrete de Fatura PIX</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunTestWhatsApp}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Disparar Notificação de Teste</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Salvar Botão */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-triade-border">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs sm:text-sm font-bold shadow-blue-glow hover:opacity-95 transition-opacity"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Configurações Salvas!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Todas as Configurações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <NewWorkspaceModal
        isOpen={isNewWsModalOpen}
        onClose={() => setIsNewWsModalOpen(false)}
      />
    </AppShell>
  );
}
