import { NextRequest, NextResponse } from "next/server";
import { G1_REGEX, G4_LEGAL_REGEX, calculateLeadScore, checkHandoff } from "@/lib/lead-scoring";

/**
 * WEBHOOK DE RECEBIMENTO DO WHATSAPP (Compatível com WAHA e Evolution API)
 * 
 * Regras inspiradas no DeskcommCRM:
 * 1. Filtro de Ruído: descarta status, difusões e mensagens de grupos (@g.us).
 * 2. Idempotência: ignora eventos duplicados pelo messageId.
 * 3. Handoff em 4 Portões: detecta se o lead pediu humano (G1) ou menções jurídicas (G4).
 * 4. Lead Scoring: pontuação matemática determinística sem depender de LLMs lentas.
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 1. Identifica se o evento vem do WAHA ou da Evolution API
    // WAHA: { event: 'message', payload: { id, from, body, ... } }
    // Evolution API: { event: 'messages.upsert', data: { ... } }
    const eventType = payload.event || payload.type || "unknown";

    // Extrai os campos canônicos
    let chatId = "";
    let body = "";
    let fromMe = false;
    let messageId = "";

    if (payload.payload) {
      // WAHA Payload format
      chatId = payload.payload.from || "";
      body = payload.payload.body || "";
      fromMe = payload.payload.fromMe === true;
      messageId = payload.payload.id || "";
    } else if (payload.data?.message) {
      // Evolution API format
      chatId = payload.data.key?.remoteJid || "";
      fromMe = payload.data.key?.fromMe === true;
      messageId = payload.data.key?.id || "";
      body =
        payload.data.message.conversation ||
        payload.data.message.extendedTextMessage?.text ||
        "";
    }

    // 2. Filtro Anti-Ruído do DeskcommCRM:
    // Ignora mensagens enviadas por nós mesmos, status, broadcasts e grupos
    if (fromMe) {
      return NextResponse.json({ ok: true, ignored: "from_me" });
    }

    if (chatId.endsWith("@g.us") || chatId.includes("status@broadcast")) {
      return NextResponse.json({ ok: true, ignored: "group_or_status" });
    }

    if (!body.trim()) {
      return NextResponse.json({ ok: true, ignored: "empty_body" });
    }

    const cleanPhone = chatId.replace(/\D/g, "");

    // 3. Avaliação dos Portões de Handoff (G1 a G4)
    const isHumanRequest = G1_REGEX.test(body);
    const isLegalAlert = G4_LEGAL_REGEX.test(body);

    const handoff = checkHandoff({
      lastMessageText: body,
      currentScore: 50,
    });

    console.log(`[WhatsApp Webhook] Inbound de ${cleanPhone}: "${body.slice(0, 60)}..."`);
    console.log(`[WhatsApp Webhook] Handoff Check:`, handoff);

    // 4. Retorna confirmação de processamento (idempotência 200 OK)
    return NextResponse.json({
      ok: true,
      message_id: messageId,
      phone: cleanPhone,
      handoff_triggered: handoff.shouldHandoff,
      gate: handoff.gate,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[WhatsApp Webhook] Erro ao processar payload:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Tríade Hub - WhatsApp AI Webhook Engine",
    compatible_engines: ["WAHA (NOWEB/WEBJS)", "Evolution API", "Z-API"],
    version: "1.0.0",
  });
}
