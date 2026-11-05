"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Settings, ShieldCheck, Building2, Palette, Globe, Key, Bell } from "lucide-react";
import { useTriade } from "@/lib/store";

export default function ConfiguracoesPage() {
  const { workspace } = useTriade();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Settings className="h-4 w-4" />
              <span>Configurações do SaaS & Agência</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              White-Label & Multi-Tenancy
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Preparado para multi-tenancy e licenciamento para outras agências na Fase 4.
            </p>
          </div>

          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold">
            Fase 4 no Roadmap
          </span>
        </div>

        {/* Configurações da Agência */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-triade-border bg-[#121215] p-6 shadow-card-subtle space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-triade-border">
              <div className="h-9 w-9 rounded-xl bg-triade-gold/20 text-triade-gold flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Dados do Workspace (Agência Matriz)
                </h3>
                <p className="text-xs text-zinc-400">
                  Identidade visual e domínio customizado
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Nome da Agência
                </label>
                <input
                  type="text"
                  readOnly
                  value={workspace.name}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Slug do Workspace
                </label>
                <input
                  type="text"
                  readOnly
                  value={workspace.slug}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Domínio Customizado
                </label>
                <input
                  type="text"
                  readOnly
                  value={workspace.custom_domain}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-triade-border bg-[#121215] p-6 shadow-card-subtle space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-triade-border">
              <div className="h-9 w-9 rounded-xl bg-triade-cyan/20 text-triade-cyanLight flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Paleta de Cores White-Label
                </h3>
                <p className="text-xs text-zinc-400">
                  Personalização visual para outras agências
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-triade-border bg-zinc-900/60">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-2">
                  Cor Primária (Dourado Metálico)
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-triade-gold border border-triade-goldLight shadow-sm" />
                  <span className="font-mono text-xs text-zinc-300">#D4AF37</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-triade-border bg-zinc-900/60">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-2">
                  Cor de Destaque (Ciano Fosco)
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-triade-cyan border border-triade-cyanLight shadow-sm" />
                  <span className="font-mono text-xs text-zinc-300">#0DA5A0</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black/40 p-3.5">
              <span className="text-xs font-bold text-zinc-300 block mb-1">
                Multi-Tenancy Totalmente Suportado
              </span>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Todas as 9 tabelas do Supabase possuem chave estrangeira <code>workspace_id</code> com Row Level Security (RLS) habilitado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
