"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useTriade } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority } from "@/types/database";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";

export default function ProjetosKanbanPage() {
  const { tasks, clients, updateTaskStatus, deleteTask, updateTask } = useTriade();

  const [selectedClientId, setSelectedClientId] = useState<string>("todos");
  const [selectedPriority, setSelectedPriority] = useState<string>("todas");
  const [onlyClientVisible, setOnlyClientVisible] = useState<boolean>(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<TaskStatus>("todo");

  const columns: { id: TaskStatus; label: string; countColor: string; headerColor: string }[] = [
    {
      id: "todo",
      label: "A Fazer",
      countColor: "bg-zinc-800 text-zinc-300",
      headerColor: "border-zinc-700",
    },
    {
      id: "in_progress",
      label: "Em Andamento",
      countColor: "bg-triade-cyan/20 text-triade-cyanLight border border-triade-cyan/40",
      headerColor: "border-triade-cyan",
    },
    {
      id: "review",
      label: "Em Revisão / Aprovação",
      countColor: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
      headerColor: "border-purple-500",
    },
    {
      id: "done",
      label: "Concluído",
      countColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
      headerColor: "border-emerald-500",
    },
  ];

  // Filtragem de Tarefas
  const filteredTasks = tasks.filter((task) => {
    const matchesClient =
      selectedClientId === "todos" || task.client_id === selectedClientId;
    const matchesPriority =
      selectedPriority === "todas" || task.priority === selectedPriority;
    const matchesVisibility = !onlyClientVisible || task.visible_to_client === true;

    return matchesClient && matchesPriority && matchesVisibility;
  });

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case "todo":
        return "in_progress";
      case "in_progress":
        return "review";
      case "review":
        return "done";
      case "done":
        return null;
    }
  };

  const getPreviousStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case "todo":
        return null;
      case "in_progress":
        return "todo";
      case "review":
        return "in_progress";
      case "done":
        return "review";
    }
  };

  const openNewTaskInColumn = (status: TaskStatus) => {
    setNewTaskInitialStatus(status);
    setIsNewTaskOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header do Módulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-triade-border">
          <div>
            <div className="flex items-center gap-2 text-triade-blue text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="h-4 w-4" />
              <span>Operação da Agência</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Kanban Operacional de Projetos
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Gestão de fluxo das entregas com sincronização em tempo real para o Portal do Cliente.
            </p>
          </div>

          <button
            onClick={() => openNewTaskInColumn("todo")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-sm font-bold shadow-blue-glow hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-triade-border bg-[#0E1C2A]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Cliente */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Cliente:</span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="rounded-xl border border-triade-border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none"
              >
                <option value="todos">Todos os Clientes</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Prioridade */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Prioridade:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="rounded-xl border border-triade-border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none"
              >
                <option value="todas">Todas</option>
                <option value="urgente">Urgente 🔥</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Toggle Visível no Portal */}
          <button
            onClick={() => setOnlyClientVisible(!onlyClientVisible)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              onlyClientVisible
                ? "border-triade-cyan bg-triade-cyan/15 text-triade-cyanLight shadow-blue-glow"
                : "border-zinc-800 bg-[#0B1724] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {onlyClientVisible ? (
              <Eye className="h-3.5 w-3.5 text-triade-cyan" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            <span>Apenas Visíveis no Portal</span>
          </button>
        </div>

        {/* Quadro Kanban de 4 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-triade-border bg-[#0B1724] p-4 min-h-[500px]"
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-triade-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-200">
                      {col.label}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.countColor}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openNewTaskInColumn(col.id)}
                    title={`Adicionar tarefa em ${col.label}`}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Tasks List */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnTasks.map((task) => {
                    const client = clients.find((c) => c.id === task.client_id);
                    const prevStatus = getPreviousStatus(task.status);
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="group relative rounded-xl border border-triade-border bg-[#0E1C2A] p-4 shadow-sm hover:border-triade-cyan/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Top: Client Name & Visibilidade */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate max-w-[140px]">
                              {client?.company_name || "Cliente"}
                            </span>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() =>
                                  updateTask(task.id, {
                                    visible_to_client: !task.visible_to_client,
                                  })
                                }
                                title={
                                  task.visible_to_client
                                    ? "Visível no Portal do Cliente (clique para ocultar)"
                                    : "Interno (clique para exibir no Portal)"
                                }
                                className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                                  task.visible_to_client
                                    ? "bg-triade-cyan/15 text-triade-cyanLight border border-triade-cyan/30"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {task.visible_to_client ? (
                                  <>
                                    <Eye className="h-2.5 w-2.5 text-triade-cyan" />
                                    <span>Portal</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-2.5 w-2.5" />
                                    <span>Interno</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Task Title & Description */}
                          <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {task.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom: Priority, Deadline & Move Controls */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                task.priority === "urgente"
                                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                  : task.priority === "alta"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-zinc-500 flex items-center gap-1 text-[10px]">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.deadline)}
                            </span>
                          </div>

                          {/* Setas de movimentação entre colunas */}
                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                onClick={() => updateTaskStatus(task.id, prevStatus)}
                                title="Voltar coluna"
                                className="p-1 rounded bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={() => updateTaskStatus(task.id, nextStatus)}
                                title="Avançar coluna"
                                className="p-1 rounded bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm("Excluir esta tarefa?")) {
                                  deleteTask(task.id);
                                }
                              }}
                              title="Excluir"
                              className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-zinc-600 italic">
                      Nenhuma tarefa nesta coluna
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        defaultStatus={newTaskInitialStatus}
      />
    </AppShell>
  );
}
