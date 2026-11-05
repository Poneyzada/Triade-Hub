"use client";

import React, { useState } from "react";
import { X, Building2, Palette, Globe, Sparkles, Check } from "lucide-react";
import { useTriade } from "@/lib/store";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace } = useTriade();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0DA5A0");
  const [logoUrl, setLogoUrl] = useState("");

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert("Preencha o nome da agência parceira.");
      return;
    }

    createWorkspace({
      name,
      slug,
      primary_color: primaryColor,
      logo_url: logoUrl,
    });

    alert(`🎉 Nova Agência Parceira "${name}" criada com sucesso! O workspace ativo foi alternado.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-triade-border bg-[#0E1C2A] p-6 sm:p-8 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-500 text-black font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Criar Nova Agência (Multi-Tenant White-Label)
              </h2>
              <p className="text-xs text-zinc-400">
                Gera um workspace isolado com identidade e domínio próprio
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Nome da Agência Parceira *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Vortex Growth Agency"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-triade-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Slug do Subdomínio *
            </label>
            <div className="flex items-center rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent flex-1 text-zinc-100 focus:outline-none font-mono text-xs"
              />
              <span className="text-zinc-500 text-xs">.hub.triade</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Cor Primária de Destaque (Hex)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-9 rounded-xl border border-zinc-700 bg-transparent cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              URL da Logo da Agência (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://.../logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-4 py-2 text-xs text-zinc-100 focus:outline-none"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-xs font-bold shadow-blue-glow hover:opacity-95"
            >
              Criar Workspace Isolado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
