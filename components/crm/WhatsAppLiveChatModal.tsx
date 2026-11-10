"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  MessageSquare,
  Flame,
  CheckCircle2,
  Phone,
  Building,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Proposal } from "@/types/database";
import { useTriade } from "@/lib/store";
import { LeadScoreBadge } from "./LeadScoreBadge";

interface WhatsAppLiveChatModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppLiveChatModal({
  proposal,
  isOpen,
  onClose,
}: WhatsAppLiveChatModalProps) {
  const {
    getProposalMessages,
    sendChatMessage,
    toggleAiBotStatus,
    simulateLeadTurn,
    aiAgentConfig,
  } = useTriade();

  const [inputText, setInputText] = useState("");
  const [leadSimText, setLeadSimText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "test_sim">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = proposal ? getProposalMessages(proposal.id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (!isOpen || !proposal) return null;

  const handleSendHumanMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(proposal.id, inputText.trim(), "human");
    setInputText("");
  };

  const handleSimulateLeadInput = async (customText?: string) => {
    const textToSend = customText || leadSimText;
    if (!textToSend.trim() || isSimulating) return;

    setIsSimulating(true);
    setLeadSimText("");
    try {
      await simulateLeadTurn(proposal.id, textToSend.trim());
    } catch (err) {
      console.error("Erro na simulação do turno da IA:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const isBotActive = proposal.ai_status !== "human_takeover" && proposal.ai_status !== "paused";
  const isHandoffRequested = proposal.ai_status === "handoff_requested";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] rounded-2xl border border-triade-border bg-[#050B11] shadow-2xl flex flex-col overflow-hidden">
        {/* Header do Chat */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-triade-border bg-[#0B1724]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black text-sm">
                {proposal.lead_name.charAt(0)}
              </div>
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0B1724] ${
                  isHandoffRequested
                    ? "bg-amber-400 animate-pulse"
                    : isBotActive
                    ? "bg-emerald-400"
                    : "bg-cyan-400"
                }`}
                title={
                  isHandoffRequested
                    ? "Handoff Solicitado"
                    : isBotActive
                    ? "Robô IA Ativo"
                    : "Atendimento Humano"
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>{proposal.lead_name}</span>
                  <span className="text-[11px] font-normal text-zinc-400">
                    ({proposal.company_name})
                  </span>
                </h3>

                <LeadScoreBadge proposal={proposal} compact />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-zinc-500" />
                  <span>{proposal.lead_phone}</span>
                </span>
                <span>•</span>
                <span className="text-triade-cyanLight">
                  {proposal.service_type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de Controle do Robô */}
            <button
              onClick={() =>
                toggleAiBotStatus(
                  proposal.id,
                  isBotActive ? "human_takeover" : "bot_active"
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isBotActive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
              }`}
              title="Alternar entre atendimento automático e humano"
            >
              {isBotActive ? (
                <>
                  <Bot className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">IA Ativa (Pausar)</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Humano Assumiu (Reativar IA)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Alerta de Handoff se solicitado */}
        {isHandoffRequested && (
          <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Atenção:</strong> O robô solicitou a intervenção de um vendedor humano para este lead!
              </span>
            </div>
            <button
              onClick={() => toggleAiBotStatus(proposal.id, "human_takeover")}
              className="px-2.5 py-1 rounded bg-amber-500 text-black text-[11px] font-bold hover:bg-amber-400 transition-colors"
            >
              Assumir Agora
            </button>
          </div>
        )}

        {/* Sub-Tabs: Conversa Real vs Simulador do Robô */}
        <div className="flex items-center px-4 pt-2 border-b border-triade-border bg-[#07121A] text-xs gap-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`pb-2 font-bold transition-colors border-b-2 ${
              activeTab === "chat"
                ? "border-triade-cyan text-triade-cyanLight"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Histórico da Conversa WhatsApp ({messages.length})
          </button>

          <button
            onClick={() => setActiveTab("test_sim")}
            className={`pb-2 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "test_sim"
                ? "border-triade-cyan text-triade-cyanLight"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Simulador de Testes IA (Qualificação BANT)</span>
          </button>
        </div>

        {/* Corpo do Chat / Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#050B11]/95">
          {activeTab === "test_sim" && (
            <div className="p-4 rounded-xl border border-triade-cyan/30 bg-[#0E1C2A] text-xs space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-triade-cyan flex items-center gap-1.5">
                  <Bot className="h-4 w-4" />
                  <span>Testar Reação do Robô ({aiAgentConfig.bot_name})</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  Simula o lead digitando no WhatsApp
                </span>
              </div>
              <p className="text-zinc-300 text-[11px]">
                Clique em uma frase rápida para testar como o robô calcula o BANT e decide sobre o Handoff:
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() =>
                    handleSimulateLeadInput(
                      "Gostei muito da proposta! Tenho R$ 5.000 de verba e quero marcar uma reunião pra fechar logo."
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[11px] font-semibold text-left transition-colors"
                >
                  🔥 [Compromisso + Budget] "Quero fechar e tenho R$ 5k"
                </button>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() =>
                    handleSimulateLeadInput(
                      "Quero falar com um atendente humano por favor, passa para alguém."
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold text-left transition-colors"
                >
                  ⚠️ [Gate G1] "Quero falar com um humano"
                </button>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() =>
                    handleSimulateLeadInput(
                      "Achei o valor da taxa de setup um pouco caro para nós agora."
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-[11px] font-semibold text-left transition-colors"
                >
                  📉 [Objeção de Preço] "Achei o setup caro"
                </button>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() =>
                    handleSimulateLeadInput(
                      "Preciso dobrar as vendas de Ultraformer da clínica este mês."
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-semibold text-left transition-colors"
                >
                  🎯 [Necessidade] "Preciso de mais pacientes"
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isLead = msg.sender === "lead";
            const isBot = msg.sender === "bot";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isLead ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                    isLead
                      ? "bg-[#0E1C2A] text-zinc-100 border border-triade-border rounded-tl-sm"
                      : isBot
                      ? "bg-[#082838] text-zinc-100 border border-triade-cyan/30 rounded-tr-sm"
                      : "bg-[#073648] text-white border border-sky-400/40 rounded-tr-sm"
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] pb-1 border-b border-white/10 font-bold">
                    <span
                      className={
                        isLead
                          ? "text-zinc-400"
                          : isBot
                          ? "text-triade-cyanLight flex items-center gap-1"
                          : "text-sky-300 flex items-center gap-1"
                      }
                    >
                      {isBot && <Bot className="h-3 w-3" />}
                      {!isLead && !isBot && <User className="h-3 w-3" />}
                      <span>{msg.sender_name || (isLead ? proposal.lead_name : "Agência")}</span>
                    </span>

                    <span className="text-zinc-500 font-normal">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="whitespace-pre-line text-xs">{msg.body}</p>
                </div>
              </div>
            );
          })}

          {isSimulating && (
            <div className="flex items-center gap-2 text-xs text-triade-cyanLight italic">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>{aiAgentConfig.bot_name} está formulando a resposta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Digitação */}
        <div className="p-3 sm:p-4 border-t border-triade-border bg-[#0B1724]">
          {activeTab === "test_sim" ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={leadSimText}
                onChange={(e) => setLeadSimText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSimulateLeadInput()}
                placeholder="Escreva uma mensagem como se você fosse o lead..."
                className="flex-1 rounded-xl border border-triade-border bg-[#07121A] px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
              />
              <button
                type="button"
                disabled={!leadSimText.trim() || isSimulating}
                onClick={() => handleSimulateLeadInput()}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <span>Simular Lead</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendHumanMessage} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escrever mensagem como atendente humano (pausa o robô)..."
                className="flex-1 rounded-xl border border-triade-border bg-[#07121A] px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-triade-cyan focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <span>Enviar</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
