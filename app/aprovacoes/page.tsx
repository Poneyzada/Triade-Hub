"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CheckCircle2, Sparkles, ExternalLink, MessageSquare, Clock } from "lucide-react";
import { useTriade } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AprovacoesPage() {
  const { approvals, clients } = useTriade();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-gold text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Central de Aprovações</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Aprovação de Criativos, Landing Pages & Telas
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Validação visual e feedback direto de clientes com histórico de ajustes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {approvals.map((appr) => {
            const client = clients.find((c) => c.id === appr.client_id);
            return (
              <div
                key={appr.id}
                className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-card-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-triade-border">
                    <span className="text-[10px] font-bold uppercase text-triade-gold truncate max-w-[150px]">
                      {client?.company_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        appr.status === "aprovado"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : appr.status === "solicitado_ajustes"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {appr.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 mt-3">
                    {appr.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {appr.description}
                  </p>

                  {appr.client_feedback && (
                    <div className="mt-3 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                        Feedback do Cliente:
                      </span>
                      <p className="text-xs text-zinc-200">{appr.client_feedback}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-triade-border flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    Enviado em {formatDate(appr.created_at)}
                  </span>
                  <a
                    href={appr.preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-triade-gold/30 bg-triade-gold/10 hover:bg-triade-gold/20 text-triade-goldLight text-xs font-semibold transition-colors"
                  >
                    <span>Ver Preview</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
