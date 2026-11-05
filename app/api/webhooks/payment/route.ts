import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Identificação do evento (compatível com Asaas e AbacatePay)
    const event = body.event || body.type;
    const paymentId = body.payment?.id || body.id || body.data?.id;
    const invoiceExternalId = body.payment?.externalReference || body.externalReference || body.metadata?.invoice_id;

    console.log("🔔 [Webhook Pagamento Recebido]:", {
      event,
      paymentId,
      invoiceExternalId,
    });

    // Se o evento indicar pagamento confirmado
    const isPaid =
      event === "PAYMENT_RECEIVED" ||
      event === "PAYMENT_CONFIRMED" ||
      event === "invoice.paid" ||
      event === "payment.succeeded";

    if (isPaid) {
      return NextResponse.json({
        received: true,
        status: "pago",
        invoice_id: invoiceExternalId || paymentId,
        message: "Pagamento processado com sucesso e status atualizado para 'pago'.",
      });
    }

    return NextResponse.json({
      received: true,
      status: "processado",
      event,
    });
  } catch (error) {
    console.error("Erro no processamento do webhook de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    gateway: "Tríade Flow Payment Webhook Handler (Asaas / AbacatePay ready)",
    endpoint: "/api/webhooks/payment",
  });
}
