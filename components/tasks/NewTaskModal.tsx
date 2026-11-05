"use client";

import React, { useState } from "react";
import { X, Layers, User, Calendar, AlertCircle, Eye, EyeOff, Tag } from "lucide-react";
import { useTriade } from "@/lib/store";
import { TaskStatus, TaskPriority } from "@/types/database";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultStatus?: TaskStatus;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  defaultStatus = "todo",
}) => {
  const { clients, addTask } = useTriade();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id ?? ""));
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [visibleToClient, setVisibleToClient] = useState(true);
  const [tagsInput, setTagsInput] = useState("Operação, Tríade");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      alert("Por favor, preencha o título da tarefa e selecione um cliente.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title,
      description,
      client_id: clientId,
      status,
      priority,
      deadline,
      visible_to_client: visibleToClient,
      tags,
    });

    // Reset
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-triade-border bg-[#0E1C2A] shadow-2xl p-6 sm:p-8 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-triade-cyan/20 border border-triade-cyan/40 text-triade-cyanLight">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Criar Nova Tarefa Operacional
              </h2>
              <p className="text-xs text-zinc-400">
                Adicione entregas ao fluxo da Tríade Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Otimização de Criativos Meta Ads"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
            />
          </div>

          {/* Cliente e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Cliente Associado *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-triade-cyan focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Coluna Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-triade-cyan focus:outline-none"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>

          {/* Prioridade e Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-triade-cyan focus:outline-none"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Data Limite (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-triade-cyan focus:outline-none"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Descrição / Detalhes
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o escopo da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="Ex: Meta Ads, Design, Tráfego"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900/80 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
            />
          </div>

          {/* Flag Visível no Portal do Cliente (REGRA CRÍTICA) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    visibleToClient
                      ? "bg-triade-cyan/20 text-triade-cyanLight border border-triade-cyan/40"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {visibleToClient ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    Visível no Portal do Cliente (/portal/[token])
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Se ativado, o cliente poderá acompanhar esta tarefa em tempo real.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={visibleToClient}
                onChange={(e) => setVisibleToClient(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-triade-cyan focus:ring-triade-cyan"
              />
            </label>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-triade-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-sm font-bold shadow-blue-glow hover:opacity-95 transition-opacity"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
