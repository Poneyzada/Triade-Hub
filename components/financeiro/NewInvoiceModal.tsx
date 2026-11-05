"use client";

import React, { useState } from "react";
import { X, DollarSign, Building, Calendar, Layers, Sparkles, Check } from "lucide-react";
import { useTriade } from "@/lib/store";
import { InvoiceType } from "@/types/database";

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { clients, addInvoice, generate5050Invoices, generateMRRInvoice } = useTriade();

  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">(3500);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [type, setType] = useState<InvoiceType>("mrr_trafego");

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title.trim() || !amount) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    addInvoice({
      client_id: clientId,
      title,
      amount: Number(amount),
      due_date: dueDate,
      type,
    });

    onClose();
  };

  const handleGenerate5050 = () => {
    if (!selectedClient) return;
    const value = Number(amount) || selectedClient.contract_value || 10000;
    generate5050Invoices(selectedClient.id, selectedClient.company_name, value);
    alert(`✓ Geradas com sucesso 2 faturas 50/50 (Entrada + Entrega) de R$ ${(value / 2).toLocaleString("pt-BR")} para ${selectedClient.company_name}!`);
    onClose();
  };

  const handleGenerateMRR = () => {
    if (!selectedClient) return;
    const value = selectedClient.monthly_fee || Number(amount) || 3500;
    generateMRRInvoice(selectedClient.id, value);
    alert(`✓ Mensalidade de R$ ${value.toLocaleString("pt-BR")} gerada com sucesso para ${selectedClient.company_name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-triade-border bg-[#121215] p-6 sm:p-8 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Gerar Cobrança & Fatura
              </h2>
              <p className="text-xs text-zinc-400">
                Geração inteligente de PIX Copia e Cola compatível com Asaas / AbacatePay
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Geradores Inteligentes Automáticos */}
        <div className="mt-4 p-4 rounded-xl border border-triade-gold/30 bg-triade-gold/5 space-y-2">
          <span className="text-xs font-bold text-triade-goldLight flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-triade-gold" />
            <span>Gerador Inteligente de Cobrança:</span>
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerate5050}
              className="px-3 py-1.5 rounded-lg border border-triade-gold/40 bg-triade-gold/15 text-triade-goldLight text-xs font-bold hover:bg-triade-gold/25 transition-colors"
            >
              Parcelamento 50/50 (Entrada + Entrega)
            </button>
            <button
              type="button"
              onClick={handleGenerateMRR}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
            >
              Gerar Mensalidade MRR
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.service_type.toUpperCase()} • Mensalidade: R$ {c.monthly_fee})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Título da Cobrança *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mensalidade Gestão de Tráfego - Novembro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Tipo de Cobrança
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InvoiceType)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="mrr_trafego">Mensalidade MRR (Tráfego)</option>
              <option value="entrada_projeto">Entrada de Projeto (50%)</option>
              <option value="entrega_projeto">Entrega Final de Projeto (50%)</option>
              <option value="avulso">Serviço Avulso</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-triade-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black text-xs font-bold shadow-md"
            >
              Criar Cobrança Avulsa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
