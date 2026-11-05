"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  CheckCircle2,
  Wallet,
  Settings,
  Sparkles,
  Target,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTriade } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TriadeLogo } from "@/components/ui/TriadeLogo";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { workspace, metrics } = useTriade();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Clientes & Onboarding",
      href: "/clientes",
      icon: Users,
      badge: metrics.pendingOnboardingsCount > 0 ? `${metrics.pendingOnboardingsCount} pend.` : null,
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    },
    {
      label: "Projetos (Kanban)",
      href: "/projetos",
      icon: Layers,
      badge: `${metrics.ongoingProjectsCount}`,
      badgeColor: "bg-triade-cyan/15 text-triade-cyanLight border-triade-cyan/30",
    },
    {
      label: "CRM & Propostas",
      href: "/crm",
      icon: Target,
      badge: "Pipeline",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    },
    {
      label: "Aprovações",
      href: "/aprovacoes",
      icon: CheckCircle2,
      badge: metrics.pendingApprovalsCount > 0 ? `${metrics.pendingApprovalsCount}` : null,
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    },
    {
      label: "Financeiro",
      href: "/financeiro",
      icon: Wallet,
      badge: "Caixa",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    {
      label: "Configurações SaaS",
      href: "/configuracoes",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-triade-border bg-[#07111A] transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header com o novo Logo de 3 Traços */}
        <div className="flex h-20 items-center justify-between border-b border-triade-border px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <TriadeLogo size={38} className="transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wide text-zinc-100">
                  TRÍADE
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-triade-blue">
                  HUB
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-cyan-200/50">
                Agency Operating System
              </span>
            </div>
          </Link>
        </div>

        {/* Multi-Tenancy Workspace Badge */}
        <div className="px-5 py-3 border-b border-triade-border/70 bg-[#050D15]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-xs font-medium text-zinc-300">Workspace Ativo</span>
            </div>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-triade-blue/30 bg-triade-blue/10 text-triade-blueLight">
              Multi-Tenant
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-zinc-100 truncate">
            {workspace.name}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/40">
            Navegação da Agência
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-triade-cardHover to-[#0D1D2B] text-cyan-100 border border-triade-blue/40 shadow-card-subtle"
                    : "text-zinc-400 hover:bg-triade-card/60 hover:text-zinc-200 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-triade-blue/15 text-triade-blue"
                        : "bg-[#0A1622]/60 text-zinc-400 group-hover:text-cyan-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-triade-blue shadow-[0_0_10px_#22d3ee]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Portal Rápido Card */}
        <div className="p-4 border-t border-triade-border bg-[#050D15]/90">
          <div className="rounded-xl border border-triade-border bg-triade-card/90 p-3.5 shadow-lg">
            <div className="flex items-center gap-2 text-triade-blueLight text-xs font-semibold mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Portal do Cliente VIP</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Rotas exclusivas com aprovações, faturas e tarefas.
            </p>
            <Link
              href="/portal/nexus-odonto-7k29a"
              target="_blank"
              className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-[#07131D] hover:bg-[#0B1D2C] border border-triade-border text-cyan-100 text-xs font-medium transition-colors"
            >
              <span>Ver Demo Nexus</span>
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-triade-blue" />
              <span>Tríade Studio v2.0</span>
            </div>
            <span className="text-cyan-400/80">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
