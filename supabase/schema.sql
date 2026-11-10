-- ==============================================================================
-- TRÍADE HUB - SCHEMA SUPABASE COMPLETO (FASES 1, 2, 3 E 4)
-- Multi-Tenancy, CRM, Operação, Aprovações, Financeiro e Automações
-- ==============================================================================

-- 1. WORKSPACES (Multi-Tenancy & White-Label)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#D4AF37',
    accent_color TEXT DEFAULT '#0DA5A0',
    custom_domain TEXT,
    whatsapp_webhook_url TEXT,
    payment_api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS (Clientes & Contas da Agência)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('trafego', 'site', 'app', 'full')),
    status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'ativo', 'pausado', 'cancelado')),
    monthly_fee NUMERIC(12, 2) DEFAULT 0.00,
    contract_value NUMERIC(12, 2) DEFAULT 0.00,
    portal_token TEXT UNIQUE NOT NULL,
    access_vault JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROPOSALS (CRM Comercial e Propostas Interativas)
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    lead_email TEXT NOT NULL,
    lead_phone TEXT NOT NULL,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('trafego', 'site', 'app', 'full')),
    stage TEXT NOT NULL DEFAULT 'proposta_enviada' CHECK (stage IN ('prospeccao', 'reuniao', 'proposta_enviada', 'negociacao', 'fechado', 'perdido')),
    setup_value NUMERIC(12, 2) DEFAULT 0.00,
    monthly_value NUMERIC(12, 2) DEFAULT 0.00,
    total_value NUMERIC(12, 2) NOT NULL,
    public_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('rascunho', 'enviada', 'visualizada', 'aceita', 'recusada', 'fechado')),
    diagnosis TEXT,
    scope_items JSONB DEFAULT '[]'::jsonb,
    valid_until DATE NOT NULL,
    accepted_at TIMESTAMPTZ,
    -- QUALIFICAÇÃO IA & LEAD SCORING (DeskcommCRM)
    lead_score INT DEFAULT 30,
    score_band TEXT DEFAULT 'frio' CHECK (score_band IN ('frio', 'morno', 'quente')),
    score_reason TEXT,
    bant_qualification JSONB DEFAULT '{"budget": false, "authority": false, "need": false, "timing": false}'::jsonb,
    commitments JSONB DEFAULT '[]'::jsonb,
    objections JSONB DEFAULT '[]'::jsonb,
    ai_status TEXT DEFAULT 'bot_active' CHECK (ai_status IN ('bot_active', 'human_takeover', 'handoff_requested', 'paused')),
    conversation_summary TEXT,
    last_interaction_at TIMESTAMPTZ,
    unread_messages_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.1 CHAT_MESSAGES (Histórico WhatsApp & IA SDR)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('lead', 'bot', 'human')),
    sender_name TEXT,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 AI_AGENT_CONFIGS (Configuração do Robô SDR & Conexão WAHA por Workspace)
CREATE TABLE IF NOT EXISTS public.ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    niche TEXT NOT NULL DEFAULT 'servicos_b2b',
    bot_name TEXT NOT NULL DEFAULT 'Théo (SDR Tríade)',
    system_prompt TEXT NOT NULL,
    knowledge_base TEXT,
    qualification_questions JSONB DEFAULT '[]'::jsonb,
    handoff_rules JSONB DEFAULT '{"trigger_on_explicit_request": true, "trigger_on_score_threshold": 75}'::jsonb,
    whatsapp_provider TEXT DEFAULT 'waha',
    whatsapp_server_url TEXT,
    whatsapp_api_key TEXT,
    whatsapp_session_name TEXT DEFAULT 'default',
    waha_engine TEXT DEFAULT 'NOWEB',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTRACTS (Contratos Digitais)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    total_value NUMERIC(12, 2) NOT NULL,
    setup_value NUMERIC(12, 2) DEFAULT 0.00,
    monthly_value NUMERIC(12, 2) DEFAULT 0.00,
    payment_terms TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aguardando_assinatura', 'assinado', 'expirado')),
    signed_at TIMESTAMPTZ,
    signature_ip TEXT,
    signer_name TEXT,
    signer_document TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ONBOARDING_STEPS (Motor Dinâmico de Boas-Vindas)
CREATE TABLE IF NOT EXISTS public.onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado_cliente', 'aprovado')),
    service_category TEXT NOT NULL CHECK (service_category IN ('geral', 'trafego', 'site', 'app')),
    client_response TEXT,
    client_attachment_url TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TASKS (Kanban Operacional de Projetos)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
    deadline DATE,
    visible_to_client BOOLEAN NOT NULL DEFAULT false,
    order_index INT DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. APPROVALS (Central de Aprovação de Criativos, Copy e Sites)
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    preview_url TEXT NOT NULL,
    media_url TEXT,
    copy_text TEXT,
    thumbnail_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('criativo_estatico', 'carrossel', 'video', 'copy', 'pagina_web', 'fluxo_app')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'solicitado_ajustes', 'reprovado')),
    client_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVOICES (Financeiro, MRR e Cobranças 50/50)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    type TEXT NOT NULL DEFAULT 'mrr_trafego' CHECK (type IN ('mrr_trafego', 'entrada_projeto', 'entrega_projeto', 'avulso', 'mrr', 'parcela_50_50', 'setup')),
    pix_copy_paste TEXT,
    invoice_url TEXT,
    barcode TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EXPENSES (Despesas da Agência e Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ferramentas', 'equipe', 'infra', 'marketing', 'impostos', 'outros')),
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
    is_recurring BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clients_workspace ON public.clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_clients_portal_token ON public.clients(portal_token);
CREATE INDEX IF NOT EXISTS idx_proposals_public_token ON public.proposals(public_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_client ON public.onboarding_steps(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_client ON public.approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_workspace ON public.expenses(workspace_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PÚBLICAS PARA PORTAIS E PROPOSTAS INTERATIVAS
CREATE POLICY "Public proposal view by token" ON public.proposals
FOR SELECT USING (public_token IS NOT NULL);

CREATE POLICY "Public proposal update upon close" ON public.proposals
FOR UPDATE USING (public_token IS NOT NULL);

CREATE POLICY "Public client view by portal token" ON public.clients
FOR SELECT USING (portal_token IS NOT NULL);

CREATE POLICY "Public onboarding by client" ON public.onboarding_steps
FOR ALL USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = onboarding_steps.client_id));

CREATE POLICY "Public visible tasks" ON public.tasks
FOR SELECT USING (visible_to_client = true);

CREATE POLICY "Public client approvals" ON public.approvals
FOR ALL USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = approvals.client_id));

CREATE POLICY "Public client invoices" ON public.invoices
FOR SELECT USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = invoices.client_id));

CREATE POLICY "Public client contracts" ON public.contracts
FOR ALL USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = contracts.client_id));
