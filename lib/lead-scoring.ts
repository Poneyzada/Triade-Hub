/**
 * MOTOR DE QUALIFICAÇÃO & LEAD SCORING AUDITÁVEL (Inspirado no DeskcommCRM)
 * 
 * O score é uma FÓRMULA MATEMÁTICA determinística com explicação transparente
 * de cada parcela, sem alucinações de IA, além dos 4 Portões de Handoff (G1 a G4).
 */

export interface BantQualification {
  budget?: boolean;
  authority?: boolean;
  need?: boolean;
  timing?: boolean;
  notes?: string;
}

export type ScoreBand = 'frio' | 'morno' | 'quente';

export interface ScoreCalculationResult {
  score: number;
  band: ScoreBand;
  reason: string;
  factors: {
    points: number;
    label: string;
  }[];
}

export interface HandoffCheckResult {
  shouldHandoff: boolean;
  gate?: 'G1_HUMAN_REQUEST' | 'G2_SENTIMENT_ALERT' | 'G3_BOT_UNCERTAIN' | 'G4_HIGH_SCORE' | 'G4_LEGAL_ALERT';
  reason?: string;
}

// G1: Regex para identificar solicitação explícita de atendimento humano em português
export const G1_REGEX =
  /\b(quero|preciso|posso)\s+(falar|conversar|atendimento|atendente|humano|pessoa|gente|alguem|alguém|operador|gerente|comercial|vendedor)\b|\b(humano|atendente|operador|vendedor)\s+por\s+favor\b|\bsai\s+do\s+bot\b|\bnão\s+(quero|gosto)\s+(de\s+)?(robô|bot|automatic\w*)\b|\bpassa\s+pra\s+alguem\b/i;

// G4: Regex para alertas jurídicos e reclamações que demandam atenção imediata
export const G4_LEGAL_REGEX =
  /\b(procon|advogad\w*|processar|processo\s+judicial|justiça|juiz\w*|reclame\s*aqui|denuncia\w*|denúncia\w*|acionar\s+a\s+justiça|órgão\s+regulador|defensoria|ministério\s+público)\b/i;

// Marcadores de incerteza da IA para o Gate G3
export const UNCERTAINTY_MARKERS = [
  "não tenho certeza",
  "não sei",
  "não posso confirmar",
  "não tenho essa informação",
  "preciso verificar com a equipe",
  "talvez",
  "acho que",
];

const BASE_SCORE = 30;
const POINTS_PER_COMMITMENT = 12; // máx 3 = +36
const POINTS_PER_OBJECTION = -8;  // máx 3 = -24
const POINTS_PER_BANT = 5;        // máx 4 = +20

/**
 * Calcula o Lead Score determinístico (0-100)
 */
export function calculateLeadScore(params: {
  commitments?: string[];
  objections?: string[];
  bant?: BantQualification;
  recencyHours?: number;
}): ScoreCalculationResult {
  const commitments = params.commitments || [];
  const objections = params.objections || [];
  const bant = params.bant || {};
  const recencyHours = params.recencyHours ?? 0;

  const factors: { points: number; label: string }[] = [];

  // 1. Base
  factors.push({ points: BASE_SCORE, label: "Base inicial do lead" });

  // 2. Compromissos e Sinais de Compra
  const cappedCommitments = commitments.slice(0, 3);
  if (cappedCommitments.length > 0) {
    const points = cappedCommitments.length * POINTS_PER_COMMITMENT;
    factors.push({
      points,
      label: `${cappedCommitments.length} compromisso(s) demonstrado(s)`,
    });
  }

  // 3. Objeções
  const cappedObjections = objections.slice(0, 3);
  if (cappedObjections.length > 0) {
    const points = cappedObjections.length * POINTS_PER_OBJECTION;
    factors.push({
      points,
      label: `${cappedObjections.length} objeção(ões) detectada(s)`,
    });
  }

  // 4. Qualificação BANT (Budget, Authority, Need, Timing)
  let bantCount = 0;
  const bantLabels: string[] = [];
  if (bant.budget) { bantCount++; bantLabels.push("Orçamento"); }
  if (bant.authority) { bantCount++; bantLabels.push("Decisor"); }
  if (bant.need) { bantCount++; bantLabels.push("Necessidade"); }
  if (bant.timing) { bantCount++; bantLabels.push("Prazo/Urgência"); }

  if (bantCount > 0) {
    factors.push({
      points: bantCount * POINTS_PER_BANT,
      label: `BANT: ${bantLabels.join(" + ")}`,
    });
  }

  // 5. Recência da conversa
  if (recencyHours <= 4) {
    factors.push({ points: 10, label: "Conversa em dia (< 4h)" });
  } else if (recencyHours <= 24) {
    factors.push({ points: 0, label: "Aguardando resposta no dia" });
  } else if (recencyHours <= 72) {
    factors.push({ points: -10, label: "Sem resposta há mais de 24h" });
  } else {
    factors.push({ points: -20, label: "Conversa em risco / estagnada" });
  }

  // Soma e Clamp entre 0 e 100
  const rawScore = factors.reduce((acc, f) => acc + f.points, 0);
  const score = Math.max(0, Math.min(100, rawScore));

  // Banda de Temperatura
  let band: ScoreBand = 'frio';
  if (score >= 71) {
    band = 'quente';
  } else if (score >= 41) {
    band = 'morno';
  }

  // Montagem da frase explicativa resumida
  const relevantFactors = factors
    .filter(f => f.points !== 0)
    .map(f => `${f.points > 0 ? '+' : ''}${f.points} ${f.label}`);

  const reason = relevantFactors.join(", ") || "Sem dados suficientes para score";

  return {
    score,
    band,
    reason,
    factors,
  };
}

/**
 * Avalia os 4 Portões de Handoff (Transição do Robô para Atendente Humano)
 */
export function checkHandoff(params: {
  lastMessageText: string;
  currentScore: number;
  stageRequiresHuman?: boolean;
  botOutputText?: string;
  isNegativeSentiment?: boolean;
}): HandoffCheckResult {
  const { lastMessageText, currentScore, stageRequiresHuman, botOutputText, isNegativeSentiment } = params;

  // G1: Pedido explícito de falar com humano
  if (G1_REGEX.test(lastMessageText)) {
    return {
      shouldHandoff: true,
      gate: 'G1_HUMAN_REQUEST',
      reason: 'Lead solicitou explicitamente atendimento humano.',
    };
  }

  // G4: Menção jurídica / Procon / Reclamação grave
  if (G4_LEGAL_REGEX.test(lastMessageText)) {
    return {
      shouldHandoff: true,
      gate: 'G4_LEGAL_ALERT',
      reason: 'Lead mencionou termos jurídicos ou reclamação com risco de litígio.',
    };
  }

  // G2: Sentimento agressivo ou muito insatisfeito
  if (isNegativeSentiment) {
    return {
      shouldHandoff: true,
      gate: 'G2_SENTIMENT_ALERT',
      reason: 'Sentimento de insatisfação detectado na mensagem do lead.',
    };
  }

  // G3: Bot inseguro / faltou informação na base de conhecimento
  if (botOutputText && UNCERTAINTY_MARKERS.some(m => botOutputText.toLowerCase().includes(m))) {
    return {
      shouldHandoff: true,
      gate: 'G3_BOT_UNCERTAIN',
      reason: 'Robô sinalizou incerteza sobre a pergunta e chamou a equipe.',
    };
  }

  // G4: Lead atingiu temperatura quente (Score >= 75) ou avançou para etapa que exige humano
  if (currentScore >= 75 || stageRequiresHuman) {
    return {
      shouldHandoff: true,
      gate: 'G4_HIGH_SCORE',
      reason: 'Lead altamente qualificado (Score Quente 🔥) pronto para fechamento.',
    };
  }

  return { shouldHandoff: false };
}

/**
 * Templates de Prompts Especializados por Nicho
 */
export const NICHE_AGENT_TEMPLATES = {
  servicos_b2b: {
    label: "Serviços B2B / Agências & Consultorias",
    bot_name: "Théo (SDR Tríade)",
    system_prompt: `Você é Théo, consultor executivo da Tríade Studio. Sua missão é atender leads corporativos no WhatsApp que chegam via anúncios, qualificar suas reais necessidades de captação de clientes, tráfego e desenvolvimento de sites/sistemas, e agendar uma reunião estratégica com nossos diretores.
Seja direto, profissional, caloroso e use mensagens curtas (1 a 3 frases) adaptadas ao ritmo natural de conversa do WhatsApp. Jamais envie blocos gigantescos de texto.`,
    qualification_questions: [
      { key: "need", question: "Qual é o principal desafio hoje: gerar mais leads qualificados ou ter um site/posicionamento moderno para fechar negócios?" },
      { key: "budget", question: "Vocês já têm uma verba mensal separada para investimento em marketing e mídia paga?" },
      { key: "authority", question: "Você é quem toma a decisão final sobre contratações ou tem outros sócios no projeto?" },
      { key: "timing", question: "Qual a previsão de início: querem rodar ainda este mês ou estão apenas pesquisando?" },
    ],
  },
  clinica_saude: {
    label: "Clínicas Médicas & Odontologia / Estética",
    bot_name: "Sofia (Consultora de Atendimento)",
    system_prompt: `Você é Sofia, consultora de atendimento da clínica. Seu objetivo no WhatsApp é acolher pacientes interessados em tratamentos (Harmonização, Implantes, Clareamento, Dermatologia), tirar dúvidas de forma empática e conduzir ao agendamento de uma avaliação presencial com nossos doutores especialistas.
Nunca passe diagnósticos médicos pelo WhatsApp. Foco em acolhimento e agendamento da consulta.`,
    qualification_questions: [
      { key: "need", question: "Qual procedimento você gostaria de realizar ou qual incômodo gostaria de tratar hoje?" },
      { key: "timing", question: "Você prefere atendimento durante a semana ou aos sábados pela manhã?" },
      { key: "budget", question: "Você busca facilidade de parcelamento no cartão ou prefere condições à vista?" },
      { key: "authority", question: "O agendamento é para você ou para algum familiar?" },
    ],
  },
  imobiliaria: {
    label: "Imobiliária & Corretores (Médio/Alto Padrão)",
    bot_name: "Bruno (Consultor de Imóveis)",
    system_prompt: `Você é Bruno, especialista do setor imobiliário. Você atende clientes interessados em imóveis residenciais ou comerciais. Seu papel é entender a região desejada, metragem, faixa de valor e se busca comprar à vista, financiar ou permutar, agendando uma visita com nosso corretor responsável.`,
    qualification_questions: [
      { key: "need", question: "Você busca imóvel para moradia própria ou para investimento e renda de aluguel?" },
      { key: "budget", question: "Em qual faixa de valor você está buscando seu próximo imóvel?" },
      { key: "timing", question: "Pretende se mudar nos próximos 90 dias ou busca imóveis na planta/lançamento?" },
      { key: "authority", question: "A decisão de compra será em conjunto com sua família?" },
    ],
  },
  ecommerce: {
    label: "E-commerce & Lojas Virtuais",
    bot_name: "Mia (Suporte & Vendas)",
    system_prompt: `Você é Mia, consultora virtual da loja. Você ajuda clientes no WhatsApp a tirar dúvidas de tamanhos, prazos de frete, aplicação de cupons e recuperação de carrinhos abandonados, enviando o link direto de checkout.`,
    qualification_questions: [
      { key: "need", question: "Qual produto você estava buscando ou gostaria de conhecer nossa linha de novidades?" },
      { key: "timing", question: "Precisa receber com entrega expressa para alguma data especial?" },
      { key: "budget", question: "Gostaria de aplicar um cupom de 10% de primeira compra no PIX?" },
      { key: "authority", question: "Tem alguma dúvida sobre garantia ou política de trocas?" },
    ],
  },
};
