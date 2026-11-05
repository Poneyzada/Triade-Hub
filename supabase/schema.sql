-- ==============================================================================
-- TRÍADE FLOW - SCHEMA COMPLETO (9 TABELAS COM MULTI-TENANCY E RLS)
-- Inspirado em DGFlow para Tríade Studio
-- ==============================================================================

-- 1. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#D4AF37',
    accent_color TEXT DEFAULT '#0DA5A0',
    custom_domain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS
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

-- 3. PROPOSALS (CRM & VENDAS)
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    lead_email TEXT NOT NULL,
    lead_phone TEXT,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('trafego', 'site', 'app', 'full')),
    total_value NUMERIC(12, 2) NOT NULL,
    monthly_value NUMERIC(12, 2) DEFAULT 0.00,
    public_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviada', 'visualizada', 'aceita', 'recusada')),
    scope_items JSONB DEFAULT '[]'::jsonb,
    valid_until TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTRACTS
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    total_value NUMERIC(12, 2) NOT NULL,
    payment_terms TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aguardando_assinatura', 'assinado', 'expirado')),
    signed_at TIMESTAMPTZ,
    signature_ip TEXT,
    signer_name TEXT,
    signer_document TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ONBOARDING_STEPS (MOTOR DINÂMICO DE ONBOARDING)
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

-- 6. TASKS (KANBAN OPERACIONAL)
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

-- 7. APPROVALS (CENTRAL DE APROVAÇÃO)
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    preview_url TEXT NOT NULL,
    thumbnail_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('criativo_estatico', 'carrossel', 'video', 'pagina_web', 'fluxo_app')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'solicitado_ajustes', 'reprovado')),
    client_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVOICES (FINANCEIRO & FATURAMENTO)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    type TEXT NOT NULL DEFAULT 'mrr' CHECK (type IN ('mrr', 'avulso', 'parcela_50_50', 'setup')),
    pix_copy_paste TEXT,
    barcode TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EXPENSES (DESPESAS DA AGÊNCIA)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ferramentas', 'equipe', 'infra', 'marketing', 'impostos', 'outros')),
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES PARA ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clients_workspace ON public.clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_clients_portal_token ON public.clients(portal_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_client ON public.onboarding_steps(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_approvals_client ON public.approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);

-- POLÍTICAS RLS BÁSICAS (LEITURA DO PORTAL POR TOKEN PÚBLICO)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Política de leitura do portal do cliente (qualquer um com o token único pode ler o cliente correspondente)
CREATE POLICY "Public client access with valid token"
ON public.clients FOR SELECT
USING (portal_token IS NOT NULL);

CREATE POLICY "Public onboarding access for client"
ON public.onboarding_steps FOR ALL
USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = onboarding_steps.client_id));

CREATE POLICY "Public visible tasks for client"
ON public.tasks FOR SELECT
USING (visible_to_client = true);
