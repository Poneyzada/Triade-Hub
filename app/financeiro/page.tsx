"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Wallet, DollarSign, TrendingUp, ArrowDownRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useTriade } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FinanceiroPage() {
  const { invoices, expenses, metrics, clients } = useTriade();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = metrics.monthRevenue - totalExpenses;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Wallet className="h-4 w-4" />
              <span>Gestão Financeira & Cobranças</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Fluxo de Caixa, MRR & Despesas
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Controle de mensalidades de tráfego, cobranças 50/50 de sites/apps e custos da agência.
            </p>
          </div>

          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold">
            Fase 3 no Roadmap
          </span>
        </div>

        {/* 3 Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-card-subtle">
            <span className="text-xs font-semibold uppercase text-zinc-400">
              MRR Mensal Recorrente
            </span>
            <p className="mt-2 text-2xl font-black text-triade-goldLight">
              {formatCurrency(metrics.activeMRR)}
            </p>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Contratos ativos de tráfego
            </span>
          </div>

          <div className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-card-subtle">
            <span className="text-xs font-semibold uppercase text-zinc-400">
              Faturamento no Mês
            </span>
            <p className="mt-2 text-2xl font-black text-emerald-400">
              {formatCurrency(metrics.monthRevenue)}
            </p>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Recebimentos confirmados
            </span>
          </div>

          <div className="rounded-2xl border border-triade-border bg-[#121215] p-5 shadow-card-subtle">
            <span className="text-xs font-semibold uppercase text-zinc-400">
              Despesas da Agência
            </span>
            <p className="mt-2 text-2xl font-black text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Softwares, servidores e ferramentas
            </span>
          </div>
        </div>

        {/* Tabela de Faturas Recentes */}
        <div className="rounded-2xl border border-triade-border bg-[#121215] p-6 shadow-card-subtle space-y-4">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Faturas e Cobranças dos Clientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-triade-border text-zinc-400 uppercase text-[10px] font-bold">
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Título da Fatura</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Vencimento</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {invoices.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-900/40">
                      <td className="py-3.5 font-bold text-zinc-200">
                        {client?.company_name}
                      </td>
                      <td className="py-3.5 text-zinc-300">{inv.title}</td>
                      <td className="py-3.5 uppercase text-[10px] text-zinc-400 font-semibold">
                        {inv.type.replace("_", " ")}
                      </td>
                      <td className="py-3.5 text-zinc-400">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="py-3.5 font-bold text-triade-goldLight">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            inv.status === "pago"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
