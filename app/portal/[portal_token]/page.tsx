"use client";

import React, { useState } from "react";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceType, InvoiceStatus } from "@/types/database";
import { NewInvoiceModal } from "@/components/financeiro/NewInvoiceModal";
import { NewExpenseModal } from "@/components/financeiro/NewExpenseModal";

export default function FinanceiroPage() {
  const {
    invoices,
    expenses,
    metrics,
    clients,
    markInvoiceAsPaid,
    toggleExpenseStatus,
    notifyClientWhatsApp,
  } = useTriade();

  const [activeTab, setActiveTab] = useState<"invoices" | "expenses">("invoices");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>("todos");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("todos");

  const profitMargin =
    metrics.monthRevenue > 0
      ? Math.round((metrics.netProfit / metrics.monthRevenue) * 100)
      : 0;

  const filteredInvoices = invoices.filter((inv) => {
    const matchType = invoiceTypeFilter === "todos" || inv.type === invoiceTypeFilter;
    const matchStatus = invoiceStatusFilter === "todos" || inv.status === invoiceStatusFilter;
    return matchType && matchStatus;
  });

  const handleCopyPix = (invId: string, pix: string) => {
    navigator.clipboard.writeText(pix);
    setCopiedInvoiceId(invId);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  const handleNotifyInvoice = (inv: any) => {
    const client = clients.find((c) => c.id === inv.client_id);
    if (!client) return;

    notifyClientWhatsApp({
      phone: client.phone,
      trigger: "invoice",
      data: {
        clientName: client.name,
        invoiceTitle: inv.title,
        amount: formatCurrency(inv.amount),
        dueDate: formatDate(inv.due_date),
        pixCode: inv.pix_copy_paste,
        portalToken: client.portal_token,
      },
    });
    alert(`Lembrete de fatura enviado para o WhatsApp de ${client.name}!`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-cyan text-xs font-bold uppercase tracking-wider mb-1">
              <Wallet className="h-4 w-4" />
              <span>Gestão Financeira & Fluxo de Caixa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              MRR, Cobranças 50/50 & Lucro Líquido Real
            </h1>
            <p className="text-sm text-zinc-200 mt-0.5">
              Controle inteligente de receitas, faturas conectadas ao Asaas/AbacatePay e despesas da agência.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs sm:text-sm font-bold hover:bg-red-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Despesa</span>
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs sm:text-sm font-bold shadow-blue-glow hover:opacity-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Nova Cobrança</span>
            </button>
          </div>
        </div>

        {/* 6 CARDS CONSOLIDADOS (FASE 3) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* MRR de Tráfego */}
          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-200 block mb-1">
              MRR (Tráfego Recorrente)
            </span>
            <span className="text-xl font-bold text-sky-300">
              {formatCurrency(metrics.activeMRR)}
            </span>
            <span className="text-[10px] text-zinc-300 mt-1 block">Mensalidade base</span>
          </div>

          {/* Receita Projetos (Sites/Apps) */}
          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-200 block mb-1">
              Receita Projetos (50/50)
            </span>
            <span className="text-xl font-bold text-triade-cyanLight">
              {formatCurrency(metrics.projectsRevenue)}
            </span>
            <span className="text-[10px] text-zinc-300 mt-1 block">Entradas e entregas</span>
          </div>

          {/* Total Recebido no Mês */}
          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-200 block mb-1">
              Total Recebido (Mês)
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {formatCurrency(metrics.monthRevenue)}
            </span>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">Entradas em caixa</span>
          </div>

          {/* Inadimplência / Atrasados */}
          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-200 block mb-1">
              Inadimplência
            </span>
            <span className="text-xl font-bold text-amber-400">
              {formatCurrency(metrics.totalOverdue)}
            </span>
            <span className="text-[10px] text-zinc-300 mt-1 block">Aguardando pagamento</span>
          </div>

          {/* Despesas da Agência */}
          <div className="rounded-xl border border-triade-border bg-[#0E1C2A] p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-200 block mb-1">
              Despesas & Custos
            </span>
            <span className="text-xl font-bold text-red-400">
              {formatCurrency(metrics.totalExpenses)}
            </span>
            <span className="text-[10px] text-zinc-300 mt-1 block">Ferramentas & equipe</span>
          </div>

          {/* Lucro Líquido Real */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block mb-1">
              Lucro Líquido Real
            </span>
            <span className="text-xl font-black text-emerald-400">
              {formatCurrency(metrics.netProfit)}
            </span>
            <span className="text-[10px] text-emerald-300 font-bold mt-1 block">
              {profitMargin}% de Margem
            </span>
          </div>
        </div>

        {/* Barra Visual de Fluxo de Caixa */}
        <div className="p-4 rounded-2xl border border-triade-border bg-[#0E1C2A] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-200 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Fluxo de Caixa: Recebimentos ({formatCurrency(metrics.monthRevenue)}) vs Despesas ({formatCurrency(metrics.totalExpenses)})</span>
            </span>
            <span className="text-emerald-400 font-bold">
              Resultado: {formatCurrency(metrics.netProfit)}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${Math.min(100, Math.max(10, (metrics.monthRevenue / (metrics.monthRevenue + metrics.totalExpenses || 1)) * 100))}%` }}
              title="Receitas"
            />
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${Math.min(100, Math.max(10, (metrics.totalExpenses / (metrics.monthRevenue + metrics.totalExpenses || 1)) * 100))}%` }}
              title="Despesas"
            />
          </div>
        </div>

        {/* Navegação entre Abas */}
        <div className="flex items-center gap-2 border-b border-triade-border pb-2">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "invoices"
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black shadow-blue-glow"
                : "text-zinc-200 hover:text-zinc-200"
            }`}
          >
            Contas a Receber (Faturas Clientes)
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "expenses"
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black shadow-blue-glow"
                : "text-zinc-200 hover:text-zinc-200"
            }`}
          >
            Despesas & Custos da Agência
          </button>
        </div>

        {/* TAB 1: CONTAS A RECEBER (INVOICES) */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            {/* Filtros de Faturas */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={invoiceTypeFilter}
                onChange={(e) => setInvoiceTypeFilter(e.target.value)}
                className="rounded-xl border border-triade-border bg-[#0E1C2A] px-3 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="mrr_trafego">Mensalidade MRR (Tráfego)</option>
                <option value="entrada_projeto">Entrada (50%)</option>
                <option value="entrega_projeto">Entrega (50%)</option>
                <option value="avulso">Avulso</option>
              </select>

              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="rounded-xl border border-triade-border bg-[#0E1C2A] px-3 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendentes</option>
                <option value="pago">Pagos ✓</option>
                <option value="atrasado">Atrasados</option>
              </select>
            </div>

            {/* Tabela de Invoices */}
            <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] overflow-hidden shadow-card-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-triade-border bg-[#0B1724] text-zinc-200 uppercase text-[10px] font-bold">
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Título da Fatura</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Vencimento</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredInvoices.map((inv) => {
                      const client = clients.find((c) => c.id === inv.client_id);
                      const isPaid = inv.status === "pago";

                      return (
                        <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-4 font-bold text-zinc-200">
                            {client?.company_name}
                          </td>
                          <td className="p-4 text-zinc-300 max-w-xs truncate">{inv.title}</td>
                          <td className="p-4 uppercase text-[10px] text-zinc-200 font-semibold">
                            {inv.type.replace("_", " ")}
                          </td>
                          <td className="p-4 text-zinc-200">
                            {formatDate(inv.due_date)}
                          </td>
                          <td className="p-4 font-bold text-triade-cyanLight text-sm">
                            {formatCurrency(inv.amount)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                isPaid
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inv.pix_copy_paste && (
                                <button
                                  onClick={() => handleCopyPix(inv.id, inv.pix_copy_paste!)}
                                  title="Copiar PIX Copia e Cola"
                                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                                >
                                  {copiedInvoiceId === inv.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => handleNotifyInvoice(inv)}
                                title="Enviar lembrete de fatura no WhatsApp"
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>

                              {!isPaid ? (
                                <button
                                  onClick={() => markInvoiceAsPaid(inv.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
                                >
                                  Dar Baixa
                                </button>
                              ) : (
                                <span className="text-[11px] text-zinc-300 italic">Pago ✓</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DESPESAS DA AGÊNCIA */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-triade-border bg-[#0E1C2A] overflow-hidden shadow-card-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-triade-border bg-[#0B1724] text-zinc-200 uppercase text-[10px] font-bold">
                      <th className="p-4">Despesa / Custo</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Vencimento</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Recorrência</th>
                      <th className="p-4 text-right">Status / Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-4 font-bold text-zinc-200">{exp.title}</td>
                        <td className="p-4 uppercase text-[10px] text-zinc-200 font-semibold">
                          {exp.category}
                        </td>
                        <td className="p-4 text-zinc-200">{formatDate(exp.due_date)}</td>
                        <td className="p-4 font-bold text-red-400 text-sm">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="p-4 text-zinc-200">
                          {exp.is_recurring ? "Mensal (Fixo)" : "Avulso"}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleExpenseStatus(exp.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              exp.status === "pago"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white"
                            }`}
                          >
                            {exp.status === "pago" ? "Pago ✓" : "Marcar como Pago"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <NewInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <NewExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </AppShell>
  );
}
