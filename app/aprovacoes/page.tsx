"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Plus,
  ExternalLink,
  MessageSquare,
  Clock,
  Image,
  FileText,
  Globe,
  Sparkles,
  Check,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { ApprovalStatus, Approval } from "@/types/database";
import { NewApprovalModal } from "@/components/approvals/NewApprovalModal";

export default function AprovacoesPage() {
  const { approvals, clients, reviewApproval, notifyClientWhatsApp } = useTriade();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [clientFilter, setClientFilter] = useState<string>("todos");

  const filtered = approvals.filter((a) => {
    const matchStatus = statusFilter === "todos" || a.status === statusFilter;
    const matchClient = clientFilter === "todos" || a.client_id === clientFilter;
    return matchStatus && matchClient;
  });

  const handleNotifyAgain = (appr: Approval) => {
    const client = clients.find((c) => c.id === appr.client_id);
    if (!client) return;

    notifyClientWhatsApp({
      phone: client.phone,
      trigger: "approval",
      data: {
        clientName: client.name,
        itemTitle: appr.title,
        portalToken: client.portal_token,
      },
    });
    alert(`Notificação enviada para o WhatsApp de ${client.name}!`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-gold text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Central de Aprovações de Clientes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Aprovação de Criativos, Copys, Sites & Telas
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Validação visual e feedback direto dos clientes conectado à tabela approvals do Supabase.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Subir para Aprovação</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-triade-border bg-[#121215]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Cliente:</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="rounded-xl border border-triade-border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none"
            >
              <option value="todos">Todos os Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-triade-border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Aguardando Cliente</option>
              <option value="solicitado_ajustes">Com Ajustes Solicitados</option>
              <option value="aprovado">Aprovados ✓</option>
              <option value="reprovado">Reprovados</option>
            </select>
          </div>
        </div>

        {/* Grid de Cards de Aprovação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((appr) => {
            const client = clients.find((c) => c.id === appr.client_id);

            return (
              <div
                key={appr.id}
                className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-card-subtle flex flex-col justify-between hover:border-purple-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-triade-border">
                    <span className="text-[10px] font-bold uppercase text-triade-gold truncate max-w-[150px]">
                      {client?.company_name || "Cliente"}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        appr.status === "aprovado"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : appr.status === "solicitado_ajustes"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                      }`}
                    >
                      {appr.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  {appr.media_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800 max-h-48 relative group">
                      <img
                        src={appr.media_url}
                        alt={appr.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-zinc-100 mt-3">
                    {appr.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {appr.description}
                  </p>

                  {/* Texto de Copy se houver */}
                  {appr.copy_text && (
                    <div className="mt-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-900/80">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                        Texto de Copy / Anúncio:
                      </span>
                      <p className="text-xs text-zinc-300 italic whitespace-pre-wrap leading-relaxed">
                        "{appr.copy_text}"
                      </p>
                    </div>
                  )}

                  {/* Feedback do Cliente se houver */}
                  {appr.client_feedback && (
                    <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                        Feedback / Ajuste Solicitado pelo Cliente:
                      </span>
                      <p className="text-xs text-zinc-200">{appr.client_feedback}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-triade-border flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Enviado em {formatDate(appr.created_at)}
                    </span>
                    <a
                      href={appr.preview_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition-colors"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleNotifyAgain(appr)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Reenviar WhatsApp</span>
                    </button>

                    {appr.status !== "aprovado" && (
                      <button
                        onClick={() => reviewApproval(appr.id, "aprovado")}
                        className="text-[11px] font-bold text-emerald-400 hover:underline"
                      >
                        Aprovar Manualmente ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-zinc-800">
              <CheckCircle2 className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">
                Nenhum item encontrado com os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>

      <NewApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </AppShell>
  );
}
