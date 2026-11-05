"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Building, Image, FileText, Globe, Smartphone, Sparkles } from "lucide-react";
import { useTriade } from "@/lib/store";
import { ApprovalType } from "@/types/database";

interface NewApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export const NewApprovalModal: React.FC<NewApprovalModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
}) => {
  const { clients, addApproval, notifyClientWhatsApp } = useTriade();

  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id ?? ""));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [copyText, setCopyText] = useState("");
  const [type, setType] = useState<ApprovalType>("criativo_estatico");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      alert("Por favor, preencha o título e selecione o cliente.");
      return;
    }

    const created = addApproval({
      client_id: clientId,
      title,
      description,
      preview_url: previewUrl || mediaUrl || "https://figma.com",
      media_url: mediaUrl,
      copy_text: copyText,
      type,
    });

    const client = clients.find((c) => c.id === clientId);
    if (notifyWhatsApp && client && client.phone) {
      notifyClientWhatsApp({
        phone: client.phone,
        trigger: "approval",
        data: {
          clientName: client.name,
          itemTitle: title,
          portalToken: client.portal_token,
        },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-triade-border bg-[#0E1C2A] p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-triade-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Subir Item para Aprovação do Cliente
              </h2>
              <p className="text-xs text-zinc-400">
                O cliente poderá aprovar ou solicitar ajustes no portal
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
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Título da Entrega *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carrossel 1:1 'Lentes de Resina - 3 Mitos'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "criativo_estatico", label: "Arte / Imagem", icon: Image },
              { id: "carrossel", label: "Carrossel", icon: Image },
              { id: "video", label: "Vídeo / Reels", icon: Image },
              { id: "copy", label: "Copy / Legenda", icon: FileText },
              { id: "pagina_web", label: "Site / Landing", icon: Globe },
              { id: "fluxo_app", label: "Tela de App", icon: Smartphone },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id as ApprovalType)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    type === t.id
                      ? "border-purple-500 bg-purple-500/15 text-purple-300 shadow-sm"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Descrição / Contexto para o Cliente
            </label>
            <textarea
              rows={2}
              placeholder="Instruções sobre o que avaliar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 p-2.5 text-xs text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              URL da Imagem / Banner / Media URL (Opcional para preview visual)
            </label>
            <input
              type="url"
              placeholder="https://... (link direto da imagem)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Link de Preview Externo (Figma, Drive ou Staging)
            </label>
            <input
              type="url"
              placeholder="https://figma.com/file/... ou https://staging.meusite.com"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full rounded-xl border border-triade-border bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:outline-none"
            />
          </div>

          {type === "copy" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Texto da Copy / Legenda
              </label>
              <textarea
                rows={3}
                placeholder="Cole o texto que o cliente irá avaliar..."
                value={copyText}
                onChange={(e) => setCopyText(e.target.value)}
                className="w-full rounded-xl border border-triade-border bg-zinc-900 p-2.5 text-xs text-zinc-100 focus:outline-none"
              />
            </div>
          )}

          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-medium">
              Notificar Cliente no WhatsApp automaticamente
            </span>
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-triade-cyan focus:ring-triade-cyan"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-triade-border">
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
              Publicar para Aprovação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
