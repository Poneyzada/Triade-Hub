/**
 * TRÍADE FLOW - MODELAGEM COMPLETA DO SISTEMA (9 TABELAS SUPABASE)
 * Multi-Tenancy (Workspaces), CRM Comercial, Operação, Central de Aprovações, Financeiro e Automações.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceType = 'trafego' | 'site' | 'app' | 'full';
export type ClientStatus = 'onboarding' | 'ativo' | 'pausado' | 'cancelado';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type StepStatus = 'pendente' | 'enviado_cliente' | 'aprovado';
export type ProposalStage = 'prospeccao' | 'reuniao' | 'proposta_enviada' | 'negociacao' | 'fechado' | 'perdido';
export type ProposalStatus = 'rascunho' | 'enviada' | 'visualizada' | 'aceita' | 'recusada' | 'fechado';
export type ContractStatus = 'rascunho' | 'aguardando_assinatura' | 'assinado' | 'expirado';
export type ApprovalStatus = 'pendente' | 'aprovado' | 'solicitado_ajustes' | 'reprovado';
export type ApprovalType = 'criativo_estatico' | 'carrossel' | 'video' | 'copy' | 'pagina_web' | 'fluxo_app';
export type InvoiceStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado';
export type InvoiceType = 'mrr_trafego' | 'entrada_projeto' | 'entrega_projeto' | 'avulso' | 'mrr' | 'parcela_50_50' | 'setup';
export type ExpenseCategory = 'ferramentas' | 'equipe' | 'infra' | 'marketing' | 'impostos' | 'outros';
export type ExpenseStatus = 'pendente' | 'pago';

export interface AccessVault {
  bm_id?: string;
  google_ads_account?: string;
  login_registro_br?: string;
  login_cloudflare?: string;
  drive_folder_url?: string;
  useful_links?: {
    id?: string;
    title: string;
    url: string;
    category?: string;
  }[];
  custom_fields?: Record<string, string>;
}

// 1. WORKSPACES (Multi-Tenancy & White-Label)
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  logo_url?: string;
  primary_color: string; // Ex: #D4AF37
  accent_color: string; // Ex: #0DA5A0
  custom_domain?: string;
  whatsapp_webhook_url?: string; // Evolution API / Z-API / Webhook
  payment_api_key?: string; // Asaas / AbacatePay API Key
  created_at: string;
  updated_at?: string;
}

// 2. CLIENTS (Clientes & Contas da Agência)
export interface Client {
  id: string;
  workspace_id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  service_type: ServiceType;
  status: ClientStatus;
  monthly_fee: number; // MRR em R$
  contract_value: number; // Valor global do projeto
  portal_token: string; // Rota /portal/[portal_token]
  access_vault: AccessVault;
  notes?: string;
  logo_url?: string;
  created_at: string;
  updated_at?: string;
}

// 3. PROPOSALS (CRM Comercial, Qualificação IA e Propostas Interativas)
export interface Proposal {
  id: string;
  workspace_id: string;
  client_id?: string;
  lead_name: string;
  company_name: string;
  lead_email: string;
  lead_phone: string;
  title: string;
  service_type: ServiceType;
  stage: ProposalStage; // Prospeccao, Reuniao, Proposta Enviada, Negociacao, Fechado, Perdido
  setup_value: number; // Valor de Setup Inicial
  monthly_value: number; // Mensalidade / MRR
  total_value: number; // Setup + Projeção
  public_token: string; // Rota pública /proposta/[public_token]
  status: ProposalStatus;
  diagnosis?: string; // Diagnóstico e Objetivo Estratégico
  scope_items: {
    id?: string;
    title: string;
    description: string;
    included: boolean;
  }[];
  valid_until: string;
  accepted_at?: string;
  created_at: string;

  // QUALIFICAÇÃO DE LEADS COM IA (Inspirado no DeskcommCRM)
  lead_score?: number; // 0 a 100
  score_band?: 'frio' | 'morno' | 'quente';
  score_reason?: string;
  bant_qualification?: {
    budget?: boolean;
    authority?: boolean;
    need?: boolean;
    timing?: boolean;
    notes?: string;
  };
  commitments?: string[];
  objections?: string[];
  ai_status?: 'bot_active' | 'human_takeover' | 'handoff_requested' | 'paused';
  conversation_summary?: string;
  last_interaction_at?: string;
  unread_messages_count?: number;
}

// 3.1 CHAT_MESSAGES (Histórico de Conversas de WhatsApp com Leads e IA)
export interface ChatMessage {
  id: string;
  proposal_id: string;
  workspace_id: string;
  sender: 'lead' | 'bot' | 'human';
  sender_name?: string;
  body: string;
  created_at: string;
  media_url?: string;
  status?: 'sent' | 'delivered' | 'read';
}

// 3.2 AI_AGENT_CONFIG (Configuração do Robô SDR & Conexão WhatsApp da Agência)
export type AgentNiche = 'servicos_b2b' | 'clinica_saude' | 'imobiliaria' | 'ecommerce' | 'personalizado';

export interface AiAgentConfig {
  id?: string;
  workspace_id: string;
  is_active: boolean;
  niche: AgentNiche;
  bot_name: string;
  system_prompt: string;
  knowledge_base: string;
  qualification_questions: {
    key: 'budget' | 'authority' | 'need' | 'timing';
    question: string;
  }[];
  handoff_rules: {
    trigger_on_explicit_request: boolean;
    trigger_on_score_threshold: number; // ex: 75
    trigger_on_objections_count: number; // ex: 2
    notify_whatsapp_number: string;
  };
  whatsapp_provider: 'waha' | 'evolution_api' | 'zapi' | 'webhook';
  whatsapp_server_url: string;
  whatsapp_api_key: string;
  whatsapp_session_name: string;
  waha_engine?: 'NOWEB' | 'WEBJS';
}

// 4. CONTRACTS (Contratos Digitais)
export interface Contract {
  id: string;
  workspace_id: string;
  client_id: string;
  proposal_id?: string;
  title: string;
  content: string; // Termos do contrato em Markdown
  total_value: number;
  setup_value?: number;
  monthly_value?: number;
  payment_terms: string;
  status: ContractStatus;
  signed_at?: string;
  signature_ip?: string;
  signer_name?: string;
  signer_document?: string;
  created_at: string;
}

// 5. ONBOARDING_STEPS (Motor Dinâmico de Boas-Vindas)
export interface OnboardingStep {
  id: string;
  workspace_id: string;
  client_id: string;
  title: string;
  description: string;
  order_index: number;
  status: StepStatus;
  service_category: 'geral' | 'trafego' | 'site' | 'app';
  client_response?: string;
  client_attachment_url?: string;
  completed_at?: string;
  created_at: string;
}

// 6. TASKS (Kanban Operacional de Projetos)
export interface Task {
  id: string;
  workspace_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  visible_to_client: boolean;
  order_index?: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

// 7. APPROVALS (Central de Aprovação de Criativos, Copy e Sites)
export interface Approval {
  id: string;
  workspace_id: string;
  client_id: string;
  task_id?: string;
  title: string;
  description?: string;
  preview_url: string; // Link Figma, imagem, drive ou deploy
  media_url?: string; // Imagem direta / banner
  copy_text?: string; // Texto de copy para anúncios
  thumbnail_url?: string;
  type: ApprovalType;
  status: ApprovalStatus;
  client_feedback?: string;
  reviewed_at?: string;
  created_at: string;
}

// 8. INVOICES (Financeiro, MRR e Cobranças 50/50)
export interface Invoice {
  id: string;
  workspace_id: string;
  client_id: string;
  title: string;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: InvoiceStatus;
  type: InvoiceType;
  pix_copy_paste?: string;
  invoice_url?: string;
  barcode?: string;
  receipt_url?: string;
  created_at: string;
}

// 9. EXPENSES (Despesas da Agência e Fluxo de Caixa)
export interface Expense {
  id: string;
  workspace_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: ExpenseStatus; // pendente | pago
  is_recurring: boolean;
  notes?: string;
  created_at: string;
}

// Representação de Banco Supabase para o SDK
export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Workspace>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Client>;
      };
      proposals: {
        Row: Proposal;
        Insert: Omit<Proposal, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Proposal>;
      };
      contracts: {
        Row: Contract;
        Insert: Omit<Contract, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Contract>;
      };
      onboarding_steps: {
        Row: OnboardingStep;
        Insert: Omit<OnboardingStep, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<OnboardingStep>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Task>;
      };
      approvals: {
        Row: Approval;
        Insert: Omit<Approval, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Approval>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Invoice>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Expense>;
      };
    };
  };
}
