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
import { TriadeLogo } from "@/components/ui/TriadeLogo";

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

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-triade-border bg-[#050B11]/90 px-4 sm:px-8 backdrop-blur-md">
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
            className="flex items-center gap-3 rounded-xl border border-triade-border bg-triade-card/90 px-3.5 py-2 hover:border-triade-blue/50 transition-colors shadow-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-sky-500 text-black font-bold text-xs shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">
                  {workspace.name}
                </span>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.2 border border-cyan-500/30 text-[10px] font-medium text-cyan-300">
                  Matriz
                </span>
              </div>
              <span className="text-[10px] text-cyan-300/60">
                Multi-Tenancy Ativo
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
              <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-triade-border bg-[#0B1724] p-2 shadow-2xl z-50">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/60">
                  Workspace Ativo (Agência)
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0F2030] p-2.5 border border-triade-blue/40">
                  <div className="flex items-center gap-2.5">
                    <TriadeLogo size={28} />
                    <div>
                      <p className="text-xs font-semibold text-zinc-100">
                        {workspace.name}
                      </p>
                      <p className="text-[10px] text-cyan-400/80">
                        {workspace.slug}.hub.triade
                      </p>
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-triade-blue" />
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
            if (confirm("Deseja restaurar os dados de demonstração da Tríade Studio?")) {
              resetToDefaultData();
            }
          }}
          title="Restaurar dados de demonstração iniciais"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-[#0A1622]/60 hover:bg-[#0E1E2E] text-zinc-400 hover:text-cyan-200 text-xs transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Resetar Demo</span>
        </button>

        {/* Nova Tarefa Button */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-2 rounded-xl border border-triade-blue/40 bg-triade-blue/10 hover:bg-triade-blue/20 px-3.5 py-2 text-xs sm:text-sm font-semibold text-triade-blueLight transition-all shadow-sm"
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </button>

        {/* Novo Cliente Button (Cyan-Blue Primary CTA) */}
        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-4 py-2 text-xs sm:text-sm font-extrabold text-black shadow-blue-glow hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Novo Cliente</span>
        </button>
      </div>
    </header>
  );
};
