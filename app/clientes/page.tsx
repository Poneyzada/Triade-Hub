"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Building,
  Key,
  ExternalLink,
  Copy,
  Check,
  FolderOpen,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Client, ServiceType, ClientStatus } from "@/types/database";
import { ClientDetailModal } from "@/components/clients/ClientDetailModal";
import { NewClientModal } from "@/components/clients/NewClientModal";

export default function ClientesPage() {
  const { clients, getClientSteps, getClientTasks } = useTriade();

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalDefaultTab, setModalDefaultTab] = useState<"overview" | "vault" | "onboarding" | "tasks">("overview");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtragem
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.portal_token.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService =
      serviceFilter === "todos" || c.service_type === serviceFilter;
    const matchesStatus =
      statusFilter === "todos" || c.status === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  const handleCopyLink = (client: Client) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/portal/${client.portal_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openClientWithTab = (client: Client, tab: "overview" | "vault" | "onboarding" | "tasks") => {
    setSelectedClient(client);
    setModalDefaultTab(tab);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header do Módulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-blue text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="h-4 w-4" />
              <span>Gestão de Clientes & Contas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Clientes, Cofre de Acessos & Onboarding
            </h1>
            <p className="text-sm text-zinc-200 mt-0.5">
              Controle de credenciais confidenciais, motor de onboarding dinâmico e links públicos.
            </p>
          </div>

          <button
            onClick={() => setIsNewClientOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-sm font-bold shadow-blue-glow hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Cadastrar Cliente</span>
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Input de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-300" />
            <input
              type="text"
              placeholder="Buscar por empresa, responsável, e-mail ou token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
            />
          </div>

          {/* Filtro por Serviço */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "todos", label: "Todos os Serviços" },
              { id: "trafego", label: "Tráfego" },
              { id: "site", label: "Sites" },
              { id: "app", label: "Apps" },
              { id: "full", label: "Full" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setServiceFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  serviceFilter === f.id
                    ? "border-triade-cyan bg-triade-cyan/15 text-triade-cyanLight"
                    : "border-triade-border bg-[#0E1C2A] text-zinc-200 hover:text-zinc-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filtro por Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2.5 text-xs font-semibold text-zinc-300 focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="onboarding">Em Onboarding</option>
            <option value="ativo">Ativos</option>
            <option value="pausado">Pausados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        {/* Grid de Cards de Clientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredClients.map((client) => {
            const steps = getClientSteps(client.id);
            const tasks = getClientTasks(client.id);
            const completedSteps = steps.filter(
              (s) => s.status === "aprovado" || s.status === "enviado_cliente"
            ).length;
            const progress =
              steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

            const hasBm = !!client.access_vault?.bm_id;
            const hasGoogleAds = !!client.access_vault?.google_ads_account;
            const hasDns = !!(client.access_vault?.login_registro_br || client.access_vault?.login_cloudflare);
            const hasDrive = !!client.access_vault?.drive_folder_url;

            return (
              <div
                key={client.id}
                className="rounded-2xl border border-triade-border bg-[#0E1C2A] p-6 shadow-card-subtle hover:border-triade-blue/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-triade-border">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-black font-extrabold text-lg shadow-blue-glow">
                        {client.company_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-zinc-100">
                            {client.company_name}
                          </h2>
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              client.status === "ativo"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : client.status === "onboarding"
                                ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                : "bg-zinc-800 text-zinc-200 border-zinc-700"
                            }`}
                          >
                            {client.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 mt-0.5">
                          {client.name} • {client.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300">
                      {client.service_type}
                    </span>
                  </div>

                  {/* Informações Financeiras */}
                  <div className="grid grid-cols-2 gap-3 py-4 border-b border-triade-border/60">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-200 block mb-0.5">
                        Mensalidade / MRR
                      </span>
                      <span className="text-sm font-bold text-triade-blueLight">
                        {formatCurrency(client.monthly_fee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-200 block mb-0.5">
                        Contrato Global
                      </span>
                      <span className="text-sm font-bold text-zinc-200">
                        {formatCurrency(client.contract_value)}
                      </span>
                    </div>
                  </div>

                  {/* Barra do Motor de Onboarding */}
                  <div className="py-4 border-b border-triade-border/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-triade-blue" />
                        <span>Onboarding: {completedSteps} de {steps.length} passos</span>
                      </span>
                      <span className="font-bold text-triade-blueLight">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 transition-all duration-300 shadow-blue-glow"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status do Cofre de Acessos */}
                  <div className="py-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-200 block mb-2">
                      Cofre de Acessos (access_vault):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          hasBm
                            ? "border-triade-blue/40 bg-triade-blue/10 text-triade-blueLight"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                        }`}
                      >
                        <Key className="h-3 w-3" />
                        BM ID {hasBm ? "✓" : "Pendente"}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          hasGoogleAds
                            ? "border-triade-blue/40 bg-triade-blue/10 text-triade-blueLight"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                        }`}
                      >
                        <Key className="h-3 w-3" />
                        Google Ads {hasGoogleAds ? "✓" : "Pendente"}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          hasDns
                            ? "border-triade-blue/40 bg-triade-blue/10 text-triade-blueLight"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                        }`}
                      >
                        DNS {hasDns ? "✓" : "Pendente"}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          hasDrive
                            ? "border-triade-blue/40 bg-triade-blue/10 text-triade-blueLight"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                        }`}
                      >
                        <FolderOpen className="h-3 w-3" />
                        Drive {hasDrive ? "✓" : "Pendente"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé com Ações do Card */}
                <div className="pt-4 mt-2 border-t border-triade-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openClientWithTab(client, "vault")}
                      className="px-3 py-1.5 rounded-xl border border-triade-blue/30 bg-triade-blue/10 hover:bg-triade-blue/20 text-triade-blueLight text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Cofre</span>
                    </button>
                    <button
                      onClick={() => openClientWithTab(client, "onboarding")}
                      className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Onboarding</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(client)}
                      title="Copiar link do portal público"
                      className="px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-zinc-200 text-xs transition-colors flex items-center gap-1"
                    >
                      {copiedId === client.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Link Portal</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`/portal/${client.portal_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-black text-xs font-bold shadow-sm hover:opacity-95 transition-opacity flex items-center gap-1"
                    >
                      <span>Abrir Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#0E1C2A]/50">
              <Building className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-300">
                Nenhum cliente encontrado com os filtros atuais.
              </p>
              <p className="text-xs text-zinc-300 mt-1">
                Tente ajustar os termos de busca ou cadastre um novo cliente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        defaultTab={modalDefaultTab}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
      />
    </AppShell>
  );
}
