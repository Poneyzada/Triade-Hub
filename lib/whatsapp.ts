/**
 * TRÍADE FLOW - CENTRAL DE AUTOMAÇÃO WHATSAPP
 * Disparo automático via Webhook (Evolution API / Z-API) com fallback imediato para wa.me.
 */

export interface WhatsAppNotificationPayload {
  phone: string;
  message: string;
  webhookUrl?: string;
}

export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Se não tiver código do país (55), adiciona
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppNotification({
  phone,
  message,
  webhookUrl,
}: WhatsAppNotificationPayload): Promise<{ success: boolean; fallbackUrl: string }> {
  const cleanPhone = cleanPhoneNumber(phone);
  const fallbackUrl = generateWhatsAppUrl(phone, message);

  if (webhookUrl && webhookUrl.startsWith("http")) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
          message: message,
        }),
      });
      if (response.ok) {
        return { success: true, fallbackUrl };
      }
    } catch (err) {
      console.warn("Falha no envio do webhook WhatsApp, usando fallback wa.me:", err);
    }
  }

  return { success: false, fallbackUrl };
}

// 4 MENSAGENS PRÉ-FORMATADAS DOS GATILHOS DA AGÊNCIA
export const WhatsAppTemplates = {
  // Gatilho A: Boas-vindas + Link Mágico do Onboarding
  welcomeOnboarding: (clientName: string, companyName: string, portalUrl: string) => {
    return `🚀 *Bem-vindo à Tríade Studio!*

Olá, *${clientName}*! É uma honra ter a *${companyName}* como parceira.

Preparamos o seu *Portal VIP do Cliente*, onde você pode acompanhar todas as entregas do seu projeto e preencher os passos iniciais de onboarding:

👉 *Acesse seu portal exclusivo:*
${portalUrl}

Qualquer dúvida, estamos 100% à disposição!`;
  },

  // Gatilho B: Novo Criativo / Site aguardando aprovação
  newApproval: (clientName: string, itemTitle: string, portalUrl: string) => {
    return `🎨 *Novo Material para Aprovação • Tríade Studio*

Olá, *${clientName}*! 
Nosso time acabou de finalizar uma nova entrega para a sua empresa:

📌 *Item:* ${itemTitle}

Por favor, acerte o preview e clique em *Aprovar* ou *Solicitar Ajuste* no seu portal:
👉 ${portalUrl}

Aguardamos seu feedback para seguirmos com o cronograma!`;
  },

  // Gatilho C: Lembrete de passo pendente no Onboarding
  onboardingReminder: (clientName: string, stepTitle: string, portalUrl: string) => {
    return `⚡ *Lembrete de Acessos • Tríade Studio*

Olá, *${clientName}*! 
Para que possamos avançar e colocar suas campanhas/projetos no ar, ainda precisamos de um detalhe:

⚠️ *Pendente:* ${stepTitle}

Você pode preencher ou colar os links diretamente pelo link:
👉 ${portalUrl}

Obrigado pela agilidade!`;
  },

  // Gatilho D: Lembrete de fatura próxima do vencimento
  invoiceReminder: (
    clientName: string,
    invoiceTitle: string,
    amount: string,
    dueDate: string,
    pixCode?: string,
    portalUrl?: string
  ) => {
    let msg = `💳 *Lembrete de Fatura • Tríade Studio*

Olá, *${clientName}*!
Sua fatura referente a *${invoiceTitle}* no valor de *${amount}* vence em *${dueDate}*.`;

    if (pixCode) {
      msg += `\n\n🔑 *Código PIX Copia e Cola:*\n\`\`\`${pixCode}\`\`\``;
    }

    if (portalUrl) {
      msg += `\n\n📄 Ou visualize os detalhes e comprovante no seu Portal:\n${portalUrl}`;
    }

    return msg;
  },
};
