"use client";

import React, { useState } from "react";
import { X, Sparkles, User, Building, Mail, Phone, DollarSign, CheckCircle2, Shield } from "lucide-react";
import { useTriade } from "@/lib/store";
import { ServiceType } from "@/types/database";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addClient } = useTriade();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("trafego");
  const [monthlyFee, setMonthlyFee] = useState<number | "">("");
  const [contractValue, setContractValue] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim() || !email.trim()) {
      alert("Por favor, preencha os campos obrigatórios (Contato, Empresa e E-mail).");
      return;
    }

    const created = addClient({
      name,
      company_name: companyName,
      email,
      phone,
      service_type: serviceType,
      monthly_fee: Number(monthlyFee) || 0,
      contract_value: Number(contractValue) || 0,
      notes,
    });

    // Reset form
    setName("");
    setCompanyName("");
    setEmail("");
    setPhone("");
    setMonthlyFee("");
    setContractValue("");
    setNotes("");

    onClose();
    if (onSuccess) {
      onSuccess(created.id);
    }
  };

  const getServiceTypePreview = () => {
    switch (serviceType) {
      case "trafego":
        return [
          "Conceder acesso ao Business Manager (Meta Ads)",
          "Conceder acesso ao Google Ads",
          "Link do Drive com Criativos e Identidade Visual",
          "Preencher Briefing de Público, Oferta e Concorrentes",
        ];
      case "site":
      case "app":
        return [
          "Acesso ao Domínio e DNS (Registro.br / Cloudflare)",
          "Enviar Manual da Marca e Logotipo em Vetor",
          "Referências Visuais e Escopo de Páginas/Telas",
        ];
      case "full":
        return [
          "Conceder acesso ao Business Manager (Meta Ads)",
          "Conceder acesso ao Google Ads",
          "Link do Drive com Criativos e Identidade Visual",
          "Preencher Briefing de Público, Oferta e Concorrentes",
          "Acesso ao Domínio e DNS (Registro.br / Cloudflare)",
          "Enviar Manual da Marca e Logotipo em Vetor",
          "Referências Visuais e Escopo de Páginas/Telas",
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-triade-border bg-[#121215] shadow-2xl p-6 sm:p-8 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-triade-goldLight to-triade-gold text-black font-bold">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Cadastrar Novo Cliente
              </h2>
              <p className="text-xs text-zinc-400">
                Criação de conta com disparo automático do Motor de Onboarding
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Dados Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Nome da Empresa / Marca *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Nexus Odontologia"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900/80 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none focus:ring-1 focus:ring-triade-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Contato Principal (Nome) *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Felipe Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900/80 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none focus:ring-1 focus:ring-triade-gold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                E-mail Corporativo *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="contato@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900/80 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none focus:ring-1 focus:ring-triade-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Telefone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="tel"
                  placeholder="(11) 99999-8888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900/80 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none focus:ring-1 focus:ring-triade-gold"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Serviço (CRÍTICO PARA O MOTOR DE ONBOARDING) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Tipo de Serviço Contratado * (Gera o Onboarding Automático)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: "trafego", label: "Tráfego Pago", desc: "Meta & Google Ads" },
                { type: "site", label: "Site / Landing", desc: "Desenvolvimento Web" },
                { type: "app", label: "Aplicativo", desc: "Mobile / SaaS" },
                { type: "full", label: "Full-Service", desc: "Tráfego + Dev" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setServiceType(item.type as ServiceType)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    serviceType === item.type
                      ? "border-triade-gold bg-triade-gold/10 text-white shadow-gold-glow"
                      : "border-triade-border bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-bold text-zinc-100">{item.label}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Valores Contratuais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Mensalidade / MRR (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="number"
                  placeholder="Ex: 3500"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900/80 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none focus:ring-1 focus:ring-triade-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Valor Total do Contrato (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="number"
                  placeholder="Ex: 42000"
                  value={contractValue}
                  onChange={(e) => setContractValue(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-triade-border bg-zinc-900/80 pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-triade-gold focus:outline-none focus:ring-1 focus:ring-triade-gold"
                />
              </div>
            </div>
          </div>

          {/* Preview do Motor de Onboarding Automático */}
          <div className="rounded-xl border border-triade-cyan/30 bg-triade-cyan/5 p-4">
            <div className="flex items-center gap-2 text-triade-cyanLight text-xs font-semibold mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Motor de Onboarding Dinâmico (Passos que serão gerados automaticamente):</span>
            </div>
            <ul className="space-y-1.5">
              {getServiceTypePreview().map((stepTitle, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-triade-cyan flex-shrink-0" />
                  <span>{stepTitle}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-triade-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-triade-goldLight via-triade-gold to-triade-goldDark text-black text-sm font-bold shadow-gold-glow hover:opacity-95 transition-opacity"
            >
              Criar Cliente & Disparar Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
