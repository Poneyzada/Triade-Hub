"use client";

import React, { useState } from "react";
import { X, DollarSign, Tag, Calendar, Wallet } from "lucide-react";
import { useTriade } from "@/lib/store";
import { ExpenseCategory } from "@/types/database";

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense } = useTriade();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("ferramentas");
  const [amount, setAmount] = useState<number | "">(250);
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isRecurring, setIsRecurring] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    addExpense({
      title,
      category,
      amount: Number(amount),
      due_date: dueDate,
      is_recurring: isRecurring,
      status: "pendente",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-triade-border bg-[#0E1C2A] p-6 sm:p-8 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Cadastrar Despesa / Custo
              </h2>
              <p className="text-xs text-zinc-200">
                Custos fixos e variáveis para cálculo de margem líquida real
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-200 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Título da Despesa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Assinatura OpenAI API / Servidor Supabase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              >
                <option value="ferramentas">Ferramentas & SaaS</option>
                <option value="equipe">Equipe & Freelancers</option>
                <option value="infra">Infraestrutura & Domínios</option>
                <option value="marketing">Marketing & Tráfego Próprio</option>
                <option value="impostos">Impostos & Contabilidade</option>
                <option value="outros">Outros Custos</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-medium">
              Custo Recorrente Mensal (Fixo)
            </span>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-triade-cyan focus:ring-triade-cyan"
            />
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
              className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md"
            >
              Cadastrar Despesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
