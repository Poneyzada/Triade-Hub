"use client";

import React, { useState } from "react";
import {
  Menu,
  Plus,
  Building2,
  ChevronDown,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
} from "lucide-react";
import { useTriade } from "@/lib/store";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewClient: () => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewClient,
  onOpenNewTask,
}) => {
  const { workspace, resetToDefaultData } = useTriade();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-triade-border bg-[#09090B]/90 px-4 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & Workspace Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-triade-border bg-triade-card text-zinc-300 hover:text-white lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-3 rounded-xl border border-triade-border bg-triade-card/90 px-3.5 py-2 hover:border-triade-gold/40 transition-colors shadow-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-triade-goldLight to-triade-gold text-black font-bold text-xs shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">
                  {workspace.name}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                  Matriz
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">
                Multi-Tenancy Habilitado
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {workspaceMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setWorkspaceMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-triade-border bg-[#121215] p-2 shadow-2xl z-50">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Selecione o Workspace (Agência)
                </div>
                <div className="flex items-center justify-between rounded-lg bg-zinc-800/60 p-2.5 border border-triade-gold/30">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-triade-gold text-black font-bold text-xs">
                      ▲
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-100">
                        {workspace.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {workspace.slug}.flow.triade
                      </p>
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-triade-gold" />
                </div>

                <div className="mt-2 rounded-lg border border-dashed border-zinc-700/60 p-3 text-center bg-black/20">
                  <span className="text-[11px] text-zinc-400 block mb-1">
                    Preparado para Multi-Tenancy
                  </span>
                  <p className="text-[10px] text-zinc-500">
                    Na Fase 4 será possível cadastrar novas agências parceiras e franquias white-label.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Actions: Reset Data, Quick Actions (+ Novo Cliente, + Nova Tarefa) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm("Deseja restaurar os dados de demonstração da Fase 1?")) {
              resetToDefaultData();
            }
          }}
          title="Restaurar dados de demonstração iniciais"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Resetar Demo</span>
        </button>

        {/* Nova Tarefa Button */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-2 rounded-xl border border-triade-cyan/40 bg-triade-cyan/10 hover:bg-triade-cyan/20 px-3.5 py-2 text-xs sm:text-sm font-semibold text-triade-cyanLight transition-all shadow-sm"
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </button>

        {/* Novo Cliente Button (Primary Executive Gold CTA) */}
        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-triade-goldLight via-triade-gold to-triade-goldDark px-4 py-2 text-xs sm:text-sm font-bold text-black shadow-gold-glow hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Novo Cliente</span>
        </button>
      </div>
    </header>
  );
};
