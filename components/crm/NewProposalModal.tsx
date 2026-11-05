"use client";

import React, { useState } from "react";
import { X, Sparkles, Building, User, Mail, Phone, DollarSign, Calendar, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useTriade } from "@/lib/store";
import { ServiceType } from "@/types/database";

interface NewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (token: string) => void;
}

export const NewProposalModal: React.FC<NewProposalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addProposal } = useTriade();

  const [leadName, setLeadName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("full");
  const [setupValue, setSetupValue] = useState<number | "">(5000);
  const [monthlyValue, setMonthlyValue] = useState<number | "">(3500);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [diagnosis, setDiagnosis] = useState(
    "A empresa possui grande potencial de escala, porém seu canal atual de aquisição depende de indicações e possui baixo volume de leads qualificados."
  );

  const [scopeItems, setScopeItems] = useState([
    { title: "Landing Page / Site de Alta Conversão", description: "Design executivo mobile-first em Next.js", included: true },
    { title: "Gestão Avançada de Tráfego Pago", description: "Campanhas Meta Ads e Google Ads com rastreamento", included: true },
    { title: "Criação Semanal de Criativos & Copys", description: "Artes visuais e roteiros de anúncios validados", included: true },
    { title: "Portal VIP de Acompanhamento em Tempo Real", description: "Painel exclusivo com métricas e aprovações", included: true },
  ]);

  const [newScopeTitle, setNewScopeTitle] = useState("");
  const [newScopeDesc, setNewScopeDesc] = useState("");

  if (!isOpen) return null;

  const handleAddScope = () => {
    if (!newScopeTitle.trim()) return;
    setScopeItems([
      ...scopeItems,
      { title: newScopeTitle.trim(), description: newScopeDesc.trim() || "Entregável prioritário", included: true },
    ]);
    setNewScopeTitle("");
    setNewScopeDesc("");
  };

  const handleRemoveScope = (idx: number) => {
    setScopeItems(scopeItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !companyName.trim() || !leadEmail.trim()) {
      alert("Por favor, preencha o Nome do Lead, Empresa e E-mail.");
      return;
    }

    const created = addProposal({
      lead_name: leadName,
      company_name: companyName,
      lead_email: leadEmail,
      lead_phone: leadPhone,
      title: `Proposta Estratégica Tríade Flow • ${companyName}`,
      service_type: serviceType,
      setup_value: Number(setupValue) || 0,
      monthly_value: Number(monthlyValue) || 0,
      valid_until: validUntil,
      diagnosis,
      scope_items: scopeItems,
    });

    onClose();
    if (onSuccess) {
      onSuccess(created.public_token);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-triade-border bg-[#121215] p-6 sm:p-8 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-triade-goldLight to-triade-gold text-black font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Criar Nova Proposta Comercial Interativa
              </h2>
              <p className="text-xs text-zinc-400">
                Gera link público (/proposta/[token]) com apresentação comercial de alto padrão
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Nome da Empresa / Marca *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Bastos & Associados"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Nome do Lead (Decisor) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Dr. Guilherme Bastos"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                placeholder="guilherme@empresa.com.br"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                WhatsApp do Lead *
              </label>
              <input
                type="tel"
                required
                placeholder="(11) 99881-2244"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Tipo de Serviço
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              >
                <option value="trafego">Tráfego Pago</option>
                <option value="site">Site Institucional</option>
                <option value="app">Aplicativo Mobile</option>
                <option value="full">Full-Service Tríade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Valor Setup Inicial (R$)
              </label>
              <input
                type="number"
                value={setupValue}
                onChange={(e) => setSetupValue(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Mensalidade / MRR (R$)
              </label>
              <input
                type="number"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-triade-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Diagnóstico Estratégico & Desafios da Empresa
            </label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900/90 p-3 text-xs text-zinc-200 focus:border-triade-gold focus:outline-none"
            />
          </div>

          {/* Itens de Escopo */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Entregáveis e Escopo da Proposta ({scopeItems.length} itens)
            </label>

            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {scopeItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-zinc-100 truncate">{item.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveScope(idx)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="Título do entregável"
                value={newScopeTitle}
                onChange={(e) => setNewScopeTitle(e.target.value)}
                className="sm:col-span-2 rounded-xl border border-triade-border bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100"
              />
              <input
                type="text"
                placeholder="Descrição curta"
                value={newScopeDesc}
                onChange={(e) => setNewScopeDesc(e.target.value)}
                className="sm:col-span-2 rounded-xl border border-triade-border bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddScope}
                className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 py-1.5 flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-triade-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-triade-goldLight via-triade-gold to-triade-goldDark text-black text-xs font-bold shadow-gold-glow hover:opacity-95"
            >
              Gerar Proposta & Link Público
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
