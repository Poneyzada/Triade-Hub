"use client";

import React, { useState } from "react";
import {
  X,
  Bot,
  Settings,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Server,
  Key,
  Layers,
  Save,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { useTriade } from "@/lib/store";
import { NICHE_AGENT_TEMPLATES } from "@/lib/lead-scoring";
import { AgentNiche } from "@/types/database";

interface AiAgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiAgentConfigModal({ isOpen, onClose }: AiAgentConfigModalProps) {
  const { aiAgentConfig, updateAiAgentConfig } = useTriade();

  const [activeTab, setActiveTab] = useState<"prompts" | "whatsapp" | "handoff">("prompts");
  const [selectedNiche, setSelectedNiche] = useState<AgentNiche>(aiAgentConfig.niche || "servicos_b2b");
  const [botName, setBotName] = useState(aiAgentConfig.bot_name);
  const [systemPrompt, setSystemPrompt] = useState(aiAgentConfig.system_prompt);
  const [knowledgeBase, setKnowledgeBase] = useState(aiAgentConfig.knowledge_base);
  const [serverUrl, setServerUrl] = useState(aiAgentConfig.whatsapp_server_url);
  const [apiKey, setApiKey] = useState(aiAgentConfig.whatsapp_api_key);
  const [sessionName, setSessionName] = useState(aiAgentConfig.whatsapp_session_name);
  const [provider, setProvider] = useState(aiAgentConfig.whatsapp_provider);
  const [engine, setEngine] = useState(aiAgentConfig.waha_engine || "NOWEB");
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("connected");

  if (!isOpen) return null;

  const handleApplyNicheTemplate = (niche: AgentNiche) => {
    setSelectedNiche(niche);
    const tmpl = NICHE_AGENT_TEMPLATES[niche as keyof typeof NICHE_AGENT_TEMPLATES];
    if (tmpl) {
      setBotName(tmpl.bot_name);
      setSystemPrompt(tmpl.system_prompt);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiAgentConfig({
      niche: selectedNiche,
      bot_name: botName,
      system_prompt: systemPrompt,
      knowledge_base: knowledgeBase,
      whatsapp_server_url: serverUrl,
      whatsapp_api_key: apiKey,
      whatsapp_session_name: sessionName,
      whatsapp_provider: provider,
      waha_engine: engine,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleTestWaha = () => {
    setIsTestingConnection(true);
    setConnectionStatus("testing");
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus("connected");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-triade-border bg-[#050B11] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-triade-border bg-[#0B1724]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-triade-cyan">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Central do Robô SDR (IA & WhatsApp)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                  WAHA + Supabase
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Atendimento, qualificação BANT e conexões de WhatsApp (Inspirado no DeskcommCRM).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 pt-2 border-b border-triade-border bg-[#07121A] text-xs gap-6">
          <button
            onClick={() => setActiveTab("prompts")}
            className={`pb-3 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "prompts"
                ? "border-triade-cyan text-triade-cyanLight"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prompt & Base de Conhecimento</span>
          </button>

          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`pb-3 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "whatsapp"
                ? "border-triade-cyan text-triade-cyanLight"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>Conexão WhatsApp (WAHA / Evolution)</span>
          </button>

          <button
            onClick={() => setActiveTab("handoff")}
            className={`pb-3 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "handoff"
                ? "border-triade-cyan text-triade-cyanLight"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Portões de Handoff (G1 - G4)</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "prompts" && (
            <div className="space-y-4">
              {/* Seletor de Nicho */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Templates Rápidos por Nicho:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(NICHE_AGENT_TEMPLATES).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyNicheTemplate(key as AgentNiche)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedNiche === key
                          ? "border-triade-cyan bg-cyan-500/10 text-triade-cyanLight font-bold"
                          : "border-triade-border bg-[#0E1C2A] text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome do Robô */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Nome de Apresentação da IA no WhatsApp:
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Ex: Théo (SDR Tríade)"
                  className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none"
                />
              </div>

              {/* System Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Instrução Principal do Agente (System Prompt):
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    Mensagens curtas (1 a 3 frases) recomendadas
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] p-3 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none font-mono leading-relaxed"
                />
              </div>

              {/* Base de Conhecimento (RAG) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Base de Conhecimento da Agência / FAQ & Preços:
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    A IA consulta esses dados antes de responder
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  placeholder="Descreva serviços, valores médios, diferenciais e garantias..."
                  className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] p-3 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-4">
              {/* Card de Status da Conexão */}
              <div className="p-4 rounded-xl border border-triade-border bg-[#0E1C2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                      <span>Status da Conexão WhatsApp:</span>
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Conectado (24/7)
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Engine: <strong className="text-zinc-200">NOWEB (WebSocket Ultra-Leve)</strong> • Ignora status e grupos automaticamente.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestWaha}
                  disabled={isTestingConnection}
                  className="px-3 py-1.5 rounded-lg border border-triade-cyan/40 bg-triade-cyan/10 text-triade-cyanLight text-xs font-bold hover:bg-triade-cyan/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingConnection ? "animate-spin" : ""}`} />
                  <span>Testar Ping</span>
                </button>
              </div>

              {/* Provedor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Provedor WhatsApp:
                  </label>
                  <select
                    value={provider}
                    onChange={(e: any) => setProvider(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none"
                  >
                    <option value="waha">WAHA (WhatsApp HTTP API - Recomendado)</option>
                    <option value="evolution_api">Evolution API (Multi-Device)</option>
                    <option value="zapi">Z-API</option>
                    <option value="webhook">Webhook Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Engine WAHA:
                  </label>
                  <select
                    value={engine}
                    onChange={(e: any) => setEngine(e.target.value)}
                    className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none"
                  >
                    <option value="NOWEB">NOWEB (Consome 90% menos RAM - Sem Chrome)</option>
                    <option value="WEBJS">WEBJS (Chromium Headless)</option>
                  </select>
                </div>
              </div>

              {/* Servidor e API Key */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  URL da Instância WAHA / Servidor (VPS):
                </label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="http://seu-ip-da-vps:3000 ou https://waha.suaagencia.com"
                  className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Chave de API (X-Api-Key):
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Chave secreta do container"
                    className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Nome da Sessão:
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="default ou comercial_triade"
                    className="w-full rounded-xl border border-triade-border bg-[#0E1C2A] px-3.5 py-2 text-xs text-zinc-100 focus:border-triade-cyan focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "handoff" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Os <strong>4 Portões de Handoff</strong> determinam exatamente o momento em que o robô deve parar de falar e transferir o lead para um vendedor humano da agência:
              </p>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-triade-border bg-[#0E1C2A] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs mt-0.5">
                    G1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100">
                      Portão G1: Pedido Explícito de Humano (Ativo)
                    </h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Identifica termos em português como <em>"quero falar com atendente"</em>, <em>"humano por favor"</em>, <em>"sai do bot"</em>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-triade-border bg-[#0E1C2A] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 font-bold text-xs mt-0.5">
                    G2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100">
                      Portão G2: Alerta de Sentimento Negativo / Frustração
                    </h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Pausa o robô imediatamente se o lead demonstrar irritação, xingamentos ou estresse.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-triade-border bg-[#0E1C2A] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs mt-0.5">
                    G3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100">
                      Portão G3: Incerteza do Robô / Dúvida Técnica
                    </h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Se o cliente fizer uma pergunta fora da base de conhecimento, o robô não alucina: sinaliza incerteza e transfere.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-triade-border bg-[#0E1C2A] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs mt-0.5">
                    G4
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100">
                      Portão G4: Lead com Score Quente (≥ 75 pts) ou Termos Jurídicos
                    </h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Quando o lead fecha todos os critérios BANT e pede reunião, o sistema notifica o vendedor para fechar a venda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer com Salvar */}
          <div className="pt-4 border-t border-triade-border flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Configurações salvas isoladamente por agência (Multi-Tenant).
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-triade-border text-zinc-400 hover:text-zinc-100 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs font-bold shadow-blue-glow hover:opacity-95 transition-all"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Salvo com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
