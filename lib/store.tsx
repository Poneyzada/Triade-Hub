"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Workspace,
  Client,
  OnboardingStep,
  Task,
  Approval,
  Invoice,
  Expense,
  Proposal,
  Contract,
  ServiceType,
  TaskStatus,
  AccessVault,
  ProposalStage,
  ApprovalStatus,
  ApprovalType,
  InvoiceStatus,
  InvoiceType,
  ExpenseCategory,
} from "@/types/database";
import {
  INITIAL_WORKSPACE,
  INITIAL_CLIENTS,
  INITIAL_ONBOARDING_STEPS,
  INITIAL_TASKS,
  INITIAL_APPROVALS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
} from "@/lib/mock-data";
import { generatePortalToken } from "@/lib/utils";
import { sendWhatsAppNotification, WhatsAppTemplates } from "@/lib/whatsapp";

interface TriadeContextType {
  workspace: Workspace;
  workspaces: Workspace[];
  clients: Client[];
  onboardingSteps: OnboardingStep[];
  tasks: Task[];
  approvals: Approval[];
  invoices: Invoice[];
  expenses: Expense[];
  proposals: Proposal[];
  contracts: Contract[];

  // Métricas Computadas
  metrics: {
    activeMRR: number;
    ongoingProjectsCount: number;
    pendingOnboardingsCount: number;
    pendingApprovalsCount: number;
    monthRevenue: number;
    projectsRevenue: number;
    totalOverdue: number;
    totalExpenses: number;
    netProfit: number;
  };

  // Multi-Tenancy & Workspace
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (data: { name: string; slug: string; primary_color?: string; accent_color?: string; logo_url?: string }) => Workspace;
  updateWorkspace: (updates: Partial<Workspace>) => void;

  // Ações de Clientes & Onboarding
  addClient: (clientData: {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    service_type: ServiceType;
    monthly_fee?: number;
    contract_value?: number;
    notes?: string;
    access_vault?: AccessVault;
  }) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateAccessVault: (clientId: string, vault: Partial<AccessVault>) => void;
  
  // Ações de Onboarding Steps
  updateOnboardingStep: (stepId: string, updates: Partial<OnboardingStep>) => void;
  completeClientStep: (stepId: string, responseText: string) => void;
  
  // Ações do Kanban (Tasks)
  addTask: (taskData: Omit<Task, "id" | "workspace_id" | "created_at">) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // FASE 2: CRM & Propostas
  addProposal: (data: {
    lead_name: string;
    company_name: string;
    lead_email: string;
    lead_phone: string;
    title: string;
    service_type: ServiceType;
    setup_value: number;
    monthly_value: number;
    valid_until: string;
    diagnosis?: string;
    scope_items: { title: string; description: string; included: boolean }[];
  }) => Proposal;
  updateProposalStage: (id: string, stage: ProposalStage) => void;
  approveAndCloseProposal: (proposalId: string) => Promise<{ client: Client; contract: Contract }>;
  getProposalByToken: (token: string) => Proposal | undefined;

  // FASE 2: Contratos & Assinatura Digital
  signContract: (contractId: string, signerName: string, signerDoc: string) => void;
  getClientContract: (clientId: string) => Contract | undefined;

  // FASE 2: Central de Aprovações
  addApproval: (data: {
    client_id: string;
    title: string;
    description?: string;
    preview_url: string;
    media_url?: string;
    copy_text?: string;
    type: ApprovalType;
  }) => Approval;
  reviewApproval: (approvalId: string, status: ApprovalStatus, feedback?: string) => void;

  // FASE 3: Financeiro, Faturas e Despesas
  addInvoice: (data: {
    client_id: string;
    title: string;
    amount: number;
    due_date: string;
    type: InvoiceType;
    invoice_url?: string;
  }) => Invoice;
  markInvoiceAsPaid: (invoiceId: string) => void;
  generate5050Invoices: (clientId: string, projectTitle: string, setupValue: number) => void;
  generateMRRInvoice: (clientId: string, monthlyFee: number) => void;
  addExpense: (data: {
    title: string;
    category: ExpenseCategory;
    amount: number;
    due_date: string;
    is_recurring?: boolean;
    status?: "pendente" | "pago";
  }) => Expense;
  toggleExpenseStatus: (expenseId: string) => void;

  // FASE 4: WhatsApp
  notifyClientWhatsApp: (params: {
    phone: string;
    trigger: "welcome" | "approval" | "onboarding" | "invoice";
    data: any;
  }) => Promise<{ success: boolean; fallbackUrl: string }>;

  // Consultas Rápidas
  getClientByPortalToken: (token: string) => Client | undefined;
  getClientSteps: (clientId: string) => OnboardingStep[];
  getClientTasks: (clientId: string) => Task[];
  getClientApprovals: (clientId: string) => Approval[];
  getClientInvoices: (clientId: string) => Invoice[];

  // Utilidades
  resetToDefaultData: () => void;
  isLoaded: boolean;
}

const TriadeContext = createContext<TriadeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKSPACE: "triade_flow_workspace_v2",
  WORKSPACES_LIST: "triade_flow_workspaces_list_v2",
  CLIENTS: "triade_flow_clients_v2",
  STEPS: "triade_flow_steps_v2",
  TASKS: "triade_flow_tasks_v2",
  APPROVALS: "triade_flow_approvals_v2",
  INVOICES: "triade_flow_invoices_v2",
  EXPENSES: "triade_flow_expenses_v2",
  PROPOSALS: "triade_flow_proposals_v2",
  CONTRACTS: "triade_flow_contracts_v2",
};

export const TriadeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([INITIAL_WORKSPACE]);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(INITIAL_ONBOARDING_STEPS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);

  // Inicialização com LocalStorage (Fallback Inteligente para funcionar sem setup prévio)
  useEffect(() => {
    try {
      const savedWs = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      const savedWsList = localStorage.getItem(STORAGE_KEYS.WORKSPACES_LIST);
      const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      const savedSteps = localStorage.getItem(STORAGE_KEYS.STEPS);
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const savedApprovals = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      const savedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const savedProposals = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      const savedContracts = localStorage.getItem(STORAGE_KEYS.CONTRACTS);

      if (savedWs) setWorkspace(JSON.parse(savedWs));
      if (savedWsList) setWorkspaces(JSON.parse(savedWsList));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedSteps) setOnboardingSteps(JSON.parse(savedSteps));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedApprovals) setApprovals(JSON.parse(savedApprovals));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedProposals) setProposals(JSON.parse(savedProposals));
      if (savedContracts) setContracts(JSON.parse(savedContracts));
    } catch (e) {
      console.warn("Usando dados iniciais em memória:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sincronização automática para LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(workspace));
      localStorage.setItem(STORAGE_KEYS.WORKSPACES_LIST, JSON.stringify(workspaces));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(onboardingSteps));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    } catch (e) {
      console.error("Falha ao salvar no localStorage", e);
    }
  }, [
    isLoaded,
    workspace,
    workspaces,
    clients,
    onboardingSteps,
    tasks,
    approvals,
    invoices,
    expenses,
    proposals,
    contracts,
  ]);

  // CÁLCULO DE MÉTRICAS EXECUTIVAS E FLUXO DE CAIXA CONSOLIDADO
  const metrics = useMemo(() => {
    // 1. MRR Ativo (Soma dos clientes ativos com mensalidade)
    const activeMRR = clients
      .filter((c) => c.status === "ativo")
      .reduce((sum, c) => sum + (Number(c.monthly_fee) || 0), 0);

    // 2. Projetos em Andamento
    const ongoingProjectsCount = tasks.filter((t) => t.status !== "done").length;

    // 3. Onboardings Pendentes
    const pendingOnboardingsCount = clients.filter((c) => c.status === "onboarding").length;

    // 4. Aprovações Pendentes
    const pendingApprovalsCount = approvals.filter(
      (a) => a.status === "pendente" || a.status === "solicitado_ajustes"
    ).length;

    // 5. Total Recebido no Mês
    const monthRevenue = invoices
      .filter((inv) => inv.status === "pago")
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    // 6. Receita de Projetos (Sites/Apps)
    const projectsRevenue = invoices
      .filter((inv) => inv.status === "pago" && (inv.type === "entrada_projeto" || inv.type === "entrega_projeto" || inv.type === "parcela_50_50" || inv.type === "setup"))
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    // 7. Inadimplência (Faturas vencidas/atrasadas)
    const now = new Date().toISOString().split("T")[0];
    const totalOverdue = invoices
      .filter((inv) => inv.status === "atrasado" || (inv.status === "pendente" && inv.due_date < now))
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    // 8. Despesas da Agência
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // 9. Lucro Líquido Real
    const netProfit = monthRevenue - totalExpenses;

    return {
      activeMRR,
      ongoingProjectsCount,
      pendingOnboardingsCount,
      pendingApprovalsCount,
      monthRevenue,
      projectsRevenue,
      totalOverdue,
      totalExpenses,
      netProfit,
    };
  }, [clients, tasks, approvals, invoices, expenses]);

  // MOTOR DE ONBOARDING AUTOMÁTICO
  const generateStepsForService = (
    clientId: string,
    serviceType: ServiceType
  ): OnboardingStep[] => {
    const steps: OnboardingStep[] = [];
    let currentIndex = 1;

    // Se 'trafego' ou 'full'
    if (serviceType === "trafego" || serviceType === "full") {
      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Conceder acesso ao Business Manager (Meta Ads)",
        description:
          "Adicione a Tríade Studio como parceiro na sua BM para podermos subir campanhas e configurar o Pixel.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: "trafego",
        created_at: new Date().toISOString(),
      });

      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Conceder acesso ao Google Ads",
        description:
          "Aceite o convite da nossa MCC ou forneça seu ID de 10 dígitos do Google Ads.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: "trafego",
        created_at: new Date().toISOString(),
      });

      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Link do Drive com Criativos e Identidade Visual",
        description:
          "Disponibilize o link da pasta contendo imagens, logotipos, vídeos gravados e manuais de marca.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: "trafego",
        created_at: new Date().toISOString(),
      });

      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Preencher Briefing de Público, Oferta e Concorrentes",
        description:
          "Descreva seu cliente ideal, ticket médio, principais objeções de venda e referências de concorrentes.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: "trafego",
        created_at: new Date().toISOString(),
      });
    }

    // Se 'site', 'app' ou 'full'
    if (serviceType === "site" || serviceType === "app" || serviceType === "full") {
      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Acesso ao Domínio e DNS (Registro.br / Cloudflare)",
        description:
          "Forneça usuário/convite para o apontamento de DNS e publicação do ambiente em produção.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: serviceType === "app" ? "app" : "site",
        created_at: new Date().toISOString(),
      });

      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Enviar Manual da Marca e Logotipo em Vetor",
        description:
          "Arquivos vetoriais (.SVG, .AI, .EPS) e especificações de tipografia institucional.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: serviceType === "app" ? "app" : "site",
        created_at: new Date().toISOString(),
      });

      steps.push({
        id: `step-${Date.now()}-${currentIndex}`,
        workspace_id: workspace.id,
        client_id: clientId,
        title: "Referências Visuais e Escopo de Páginas/Telas",
        description:
          "Sites/aplicativos que você aprecia e lista detalhada das seções indispensáveis.",
        order_index: currentIndex++,
        status: "pendente",
        service_category: serviceType === "app" ? "app" : "site",
        created_at: new Date().toISOString(),
      });
    }

    return steps;
  };

  // MULTI-TENANCY WORKSPACES
  const switchWorkspace = (workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) setWorkspace(target);
  };

  const createWorkspace = (data: {
    name: string;
    slug: string;
    primary_color?: string;
    accent_color?: string;
    logo_url?: string;
  }) => {
    const newWs: Workspace = {
      id: `ws-${Date.now().toString(36)}`,
      name: data.name,
      slug: data.slug,
      primary_color: data.primary_color || "#22D3EE",
      accent_color: data.accent_color || "#0284C7",
      logo_url: data.logo_url,
      custom_domain: `${data.slug}.flow.triadestudio.com.br`,
      created_at: new Date().toISOString(),
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setWorkspace(newWs);
    return newWs;
  };

  const updateWorkspace = (updates: Partial<Workspace>) => {
    setWorkspace((prev) => {
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      setWorkspaces((list) => list.map((w) => (w.id === prev.id ? updated : w)));
      return updated;
    });
  };

  // CLIENTS
  const addClient: TriadeContextType["addClient"] = (clientData) => {
    const newId = `cli-${Date.now().toString(36)}`;
    const portalToken = generatePortalToken(clientData.company_name);

    const newClient: Client = {
      id: newId,
      workspace_id: workspace.id,
      name: clientData.name,
      company_name: clientData.company_name,
      email: clientData.email,
      phone: clientData.phone,
      service_type: clientData.service_type,
      status: "onboarding",
      monthly_fee: clientData.monthly_fee || 0,
      contract_value: clientData.contract_value || 0,
      portal_token: portalToken,
      access_vault: clientData.access_vault || { useful_links: [] },
      notes: clientData.notes,
      created_at: new Date().toISOString(),
    };

    const generatedSteps = generateStepsForService(newId, clientData.service_type);

    setClients((prev) => [newClient, ...prev]);
    setOnboardingSteps((prev) => [...prev, ...generatedSteps]);

    const welcomeTask: Task = {
      id: `tsk-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      client_id: newId,
      title: `Kickoff & Alinhamento de Onboarding: ${clientData.company_name}`,
      description: `Reunião inicial de boas-vindas e acompanhamento dos acessos solicitados.`,
      status: "todo",
      priority: "alta",
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      visible_to_client: true,
      tags: ["Onboarding", "Kickoff"],
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [welcomeTask, ...prev]);

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  const updateAccessVault = (clientId: string, vaultUpdates: Partial<AccessVault>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          access_vault: { ...c.access_vault, ...vaultUpdates },
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  const updateOnboardingStep = (stepId: string, updates: Partial<OnboardingStep>) => {
    setOnboardingSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s))
    );
  };

  const completeClientStep = (stepId: string, responseText: string) => {
    setOnboardingSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              client_response: responseText,
              status: "enviado_cliente",
              completed_at: new Date().toISOString(),
            }
          : s
      )
    );
  };

  // TASKS (KANBAN)
  const addTask: TriadeContextType["addTask"] = (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t))
    );
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // FASE 2: CRM & PROPOSTAS
  const addProposal: TriadeContextType["addProposal"] = (data) => {
    const publicToken = `prop-${data.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;

    const newProp: Proposal = {
      id: `prop-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      lead_name: data.lead_name,
      company_name: data.company_name,
      lead_email: data.lead_email,
      lead_phone: data.lead_phone,
      title: data.title,
      service_type: data.service_type,
      stage: "proposta_enviada",
      status: "enviada",
      setup_value: data.setup_value,
      monthly_value: data.monthly_value,
      total_value: data.setup_value + data.monthly_value * 12,
      public_token: publicToken,
      diagnosis: data.diagnosis,
      scope_items: data.scope_items.map((s, i) => ({ ...s, id: `scope-${i + 1}` })),
      valid_until: data.valid_until,
      created_at: new Date().toISOString(),
    };

    setProposals((prev) => [newProp, ...prev]);
    return newProp;
  };

  const updateProposalStage = (id: string, stage: ProposalStage) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage, status: stage === "fechado" ? "fechado" : p.status } : p))
    );
  };

  /**
   * AUTOMAÇÃO CRÍTICA DE FECHAMENTO (FASE 2)
   * Quando o cliente aprova a proposta:
   * a) Muda stage da proposta para 'fechado' e grava accepted_at.
   * b) Cria automaticamente o cliente em clients.
   * c) Dispara o motor de onboarding_steps.
   * d) Gera automaticamente o contrato em contracts.
   * e) Retorna o novo cliente para redirecionamento ao Portal.
   */
  const approveAndCloseProposal = async (proposalId: string) => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) throw new Error("Proposta não encontrada");

    const acceptedAt = new Date().toISOString();

    // a) Atualiza proposta
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, stage: "fechado", status: "fechado", accepted_at: acceptedAt } : p
      )
    );

    // b) Cria cliente na tabela clients
    const clientId = `cli-${Date.now().toString(36)}`;
    const portalToken = generatePortalToken(prop.company_name);

    const newClient: Client = {
      id: clientId,
      workspace_id: workspace.id,
      name: prop.lead_name,
      company_name: prop.company_name,
      email: prop.lead_email,
      phone: prop.lead_phone,
      service_type: prop.service_type,
      status: "onboarding",
      monthly_fee: prop.monthly_value,
      contract_value: prop.total_value,
      portal_token: portalToken,
      access_vault: { useful_links: [] },
      notes: `Convertido automaticamente via Proposta Interativa (${prop.title}). Diagnóstico: ${prop.diagnosis || "N/A"}`,
      created_at: new Date().toISOString(),
    };

    // c) Dispara motor de onboarding
    const steps = generateStepsForService(clientId, prop.service_type);

    // d) Gera contrato na tabela contracts
    const contractId = `ct-${Date.now().toString(36)}`;
    const newContract: Contract = {
      id: contractId,
      workspace_id: workspace.id,
      client_id: clientId,
      proposal_id: prop.id,
      title: `Contrato de Prestação de Serviços: ${prop.title}`,
      content: `# CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS

Entre **${workspace.name}** (CONTRATADA) e **${prop.company_name}** (CONTRATANTE), representada por **${prop.lead_name}**.

### 1. DO OBJETO E ESCOPO
O presente contrato formaliza os serviços de ${prop.service_type.toUpperCase()}:
${prop.scope_items.filter((s) => s.included).map((s) => `- **${s.title}**: ${s.description}`).join("\n")}

### 2. DO INVESTIMENTO E CONDIÇÕES
- **Setup Inicial:** R$ ${prop.setup_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- **Mensalidade / Retainer:** R$ ${prop.monthly_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / mês
- **Condições:** Vencimento recorrente todo dia 10.

### 3. CONFIDENCIALIDADE
As partes comprometem-se a guardar absoluto sigilo sobre credenciais, acessos e estratégias comerciais compartilhadas no Portal do Cliente.`,
      total_value: prop.total_value,
      setup_value: prop.setup_value,
      monthly_value: prop.monthly_value,
      payment_terms: `Setup de R$ ${prop.setup_value.toLocaleString("pt-BR")} + R$ ${prop.monthly_value.toLocaleString("pt-BR")}/mês.`,
      status: "aguardando_assinatura",
      created_at: new Date().toISOString(),
    };

    // Gera tarefas iniciais e faturas iniciais se tiver setup
    if (prop.setup_value > 0) {
      if (prop.service_type === "site" || prop.service_type === "app") {
        // Gerar parcelamento 50/50
        const half = prop.setup_value / 2;
        const inv1: Invoice = {
          id: `inv-${Date.now()}-1`,
          workspace_id: workspace.id,
          client_id: clientId,
          title: `Entrada (50%) - ${prop.title}`,
          amount: half,
          due_date: new Date().toISOString().split("T")[0],
          status: "pendente",
          type: "entrada_projeto",
          pix_copy_paste: `00020126580014BR.GOV.BCB.PIX0136triadestudio@pix.com.br5204000053039865408${half}.005802BR5913TRIADE STUDIO6009SAO PAULO62070503***6304E110`,
          invoice_url: `https://asaas.com/i/inv-${clientId}-entrada`,
          created_at: new Date().toISOString(),
        };
        const inv2: Invoice = {
          id: `inv-${Date.now()}-2`,
          workspace_id: workspace.id,
          client_id: clientId,
          title: `Entrega Final (50%) - ${prop.title}`,
          amount: half,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "pendente",
          type: "entrega_projeto",
          pix_copy_paste: `00020126580014BR.GOV.BCB.PIX0136triadestudio@pix.com.br5204000053039865408${half}.005802BR5913TRIADE STUDIO6009SAO PAULO62070503***6304E111`,
          invoice_url: `https://asaas.com/i/inv-${clientId}-entrega`,
          created_at: new Date().toISOString(),
        };
        setInvoices((prev) => [inv1, inv2, ...prev]);
      }
    }

    setClients((prev) => [newClient, ...prev]);
    setOnboardingSteps((prev) => [...prev, ...steps]);
    setContracts((prev) => [newContract, ...prev]);

    return { client: newClient, contract: newContract };
  };

  const getProposalByToken = (token: string) => {
    return proposals.find((p) => p.public_token.toLowerCase() === token.toLowerCase());
  };

  const signContract = (contractId: string, signerName: string, signerDoc: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: "assinado",
              signed_at: new Date().toISOString(),
              signer_name: signerName,
              signer_document: signerDoc,
              signature_ip: "189.120.44.12",
            }
          : c
      )
    );
  };

  const getClientContract = (clientId: string) => {
    return contracts.find((c) => c.client_id === clientId);
  };

  // FASE 2: CENTRAL DE APROVAÇÕES
  const addApproval: TriadeContextType["addApproval"] = (data) => {
    const newApproval: Approval = {
      id: `appr-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      client_id: data.client_id,
      title: data.title,
      description: data.description,
      preview_url: data.preview_url,
      media_url: data.media_url,
      copy_text: data.copy_text,
      type: data.type,
      status: "pendente",
      created_at: new Date().toISOString(),
    };
    setApprovals((prev) => [newApproval, ...prev]);
    return newApproval;
  };

  const reviewApproval = (approvalId: string, status: ApprovalStatus, feedback?: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status,
              client_feedback: feedback || a.client_feedback,
              reviewed_at: new Date().toISOString(),
            }
          : a
      )
    );
  };

  // FASE 3: FINANCEIRO, FATURAS E DESPESAS
  const addInvoice: TriadeContextType["addInvoice"] = (data) => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      client_id: data.client_id,
      title: data.title,
      amount: data.amount,
      due_date: data.due_date,
      status: "pendente",
      type: data.type,
      pix_copy_paste: `00020126580014BR.GOV.BCB.PIX0136triadestudio@pix.com.br5204000053039865408${data.amount}.005802BR5913TRIADE STUDIO6009SAO PAULO62070503***6304F99A`,
      invoice_url: data.invoice_url || `https://asaas.com/i/inv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const markInvoiceAsPaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "pago", paid_at: new Date().toISOString() }
          : inv
      )
    );
  };

  const generate5050Invoices = (clientId: string, projectTitle: string, setupValue: number) => {
    const half = setupValue / 2;
    const inv1: Invoice = {
      id: `inv-${Date.now()}-1`,
      workspace_id: workspace.id,
      client_id: clientId,
      title: `Entrada (50%) - ${projectTitle}`,
      amount: half,
      due_date: new Date().toISOString().split("T")[0],
      status: "pendente",
      type: "entrada_projeto",
      pix_copy_paste: `00020126580014BR.GOV.BCB.PIX0136triadestudio@pix.com.br5204000053039865408${half}.005802BR5913TRIADE STUDIO6009SAO PAULO62070503***6304C101`,
      invoice_url: `https://asaas.com/i/inv-5050-${Date.now()}-1`,
      created_at: new Date().toISOString(),
    };
    const inv2: Invoice = {
      id: `inv-${Date.now()}-2`,
      workspace_id: workspace.id,
      client_id: clientId,
      title: `Entrega Final (50%) - ${projectTitle}`,
      amount: half,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pendente",
      type: "entrega_projeto",
      pix_copy_paste: `00020126580014BR.GOV.BCB.PIX0136triadestudio@pix.com.br5204000053039865408${half}.005802BR5913TRIADE STUDIO6009SAO PAULO62070503***6304C102`,
      invoice_url: `https://asaas.com/i/inv-5050-${Date.now()}-2`,
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => [inv1, inv2, ...prev]);
  };

  const generateMRRInvoice = (clientId: string, monthlyFee: number) => {
    const client = clients.find((c) => c.id === clientId);
    const title = `Mensalidade Gestão de Tráfego - ${new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date())}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      client_id: clientId,
      title: title,
      amount: monthlyFee,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pendente",
      type: "mrr_trafego",
      pix_copy_paste: `00020126580014BR.GOV.BCB.PIX0136triadestudio@pix.com.br5204000053039865408${monthlyFee}.005802BR5913TRIADE STUDIO6009SAO PAULO62070503***6304MRR1`,
      invoice_url: `https://asaas.com/i/inv-mrr-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const addExpense: TriadeContextType["addExpense"] = (data) => {
    const newExp: Expense = {
      id: `exp-${Date.now().toString(36)}`,
      workspace_id: workspace.id,
      title: data.title,
      category: data.category,
      amount: data.amount,
      due_date: data.due_date,
      status: data.status || "pendente",
      is_recurring: data.is_recurring ?? true,
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const toggleExpenseStatus = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              status: e.status === "pago" ? "pendente" : "pago",
              paid_at: e.status === "pago" ? undefined : new Date().toISOString(),
            }
          : e
      )
    );
  };

  // FASE 4: WHATSAPP TRIGGER DISPATCHER
  const notifyClientWhatsApp: TriadeContextType["notifyClientWhatsApp"] = async ({
    phone,
    trigger,
    data,
  }) => {
    let message = "";
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    switch (trigger) {
      case "welcome":
        message = WhatsAppTemplates.welcomeOnboarding(
          data.clientName,
          data.companyName,
          `${origin}/portal/${data.portalToken}`
        );
        break;
      case "approval":
        message = WhatsAppTemplates.newApproval(
          data.clientName,
          data.itemTitle,
          `${origin}/portal/${data.portalToken}`
        );
        break;
      case "onboarding":
        message = WhatsAppTemplates.onboardingReminder(
          data.clientName,
          data.stepTitle,
          `${origin}/portal/${data.portalToken}`
        );
        break;
      case "invoice":
        message = WhatsAppTemplates.invoiceReminder(
          data.clientName,
          data.invoiceTitle,
          data.amount,
          data.dueDate,
          data.pixCode,
          `${origin}/portal/${data.portalToken}`
        );
        break;
    }

    const res = await sendWhatsAppNotification({
      phone,
      message,
      webhookUrl: workspace.whatsapp_webhook_url,
    });

    return res;
  };

  // Consultas Rápidas
  const getClientByPortalToken = (token: string) => {
    return clients.find((c) => c.portal_token.toLowerCase() === token.toLowerCase());
  };

  const getClientSteps = (clientId: string) => {
    return onboardingSteps
      .filter((s) => s.client_id === clientId)
      .sort((a, b) => a.order_index - b.order_index);
  };

  const getClientTasks = (clientId: string) => {
    return tasks.filter((t) => t.client_id === clientId);
  };

  const getClientApprovals = (clientId: string) => {
    return approvals.filter((a) => a.client_id === clientId);
  };

  const getClientInvoices = (clientId: string) => {
    return invoices.filter((i) => i.client_id === clientId);
  };

  const resetToDefaultData = () => {
    setWorkspace(INITIAL_WORKSPACE);
    setWorkspaces([INITIAL_WORKSPACE]);
    setClients(INITIAL_CLIENTS);
    setOnboardingSteps(INITIAL_ONBOARDING_STEPS);
    setTasks(INITIAL_TASKS);
    setApprovals(INITIAL_APPROVALS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setProposals(INITIAL_PROPOSALS);
    setContracts(INITIAL_CONTRACTS);
    try {
      localStorage.clear();
    } catch {}
  };

  return (
    <TriadeContext.Provider
      value={{
        workspace,
        workspaces,
        clients,
        onboardingSteps,
        tasks,
        approvals,
        invoices,
        expenses,
        proposals,
        contracts,
        metrics,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        addClient,
        updateClient,
        updateAccessVault,
        updateOnboardingStep,
        completeClientStep,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        addProposal,
        updateProposalStage,
        approveAndCloseProposal,
        getProposalByToken,
        signContract,
        getClientContract,
        addApproval,
        reviewApproval,
        addInvoice,
        markInvoiceAsPaid,
        generate5050Invoices,
        generateMRRInvoice,
        addExpense,
        toggleExpenseStatus,
        notifyClientWhatsApp,
        getClientByPortalToken,
        getClientSteps,
        getClientTasks,
        getClientApprovals,
        getClientInvoices,
        resetToDefaultData,
        isLoaded,
      }}
    >
      {children}
    </TriadeContext.Provider>
  );
};

export const useTriade = () => {
  const context = useContext(TriadeContext);
  if (!context) {
    throw new Error("useTriade deve ser usado dentro de um TriadeProvider");
  }
  return context;
};
