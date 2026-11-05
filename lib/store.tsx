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
  ServiceType,
  TaskStatus,
  AccessVault,
} from "@/types/database";
import {
  INITIAL_WORKSPACE,
  INITIAL_CLIENTS,
  INITIAL_ONBOARDING_STEPS,
  INITIAL_TASKS,
  INITIAL_APPROVALS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
} from "@/lib/mock-data";
import { generatePortalToken } from "@/lib/utils";

interface TriadeContextType {
  workspace: Workspace;
  clients: Client[];
  onboardingSteps: OnboardingStep[];
  tasks: Task[];
  approvals: Approval[];
  invoices: Invoice[];
  expenses: Expense[];
  
  // Métricas Computadas
  metrics: {
    activeMRR: number;
    ongoingProjectsCount: number;
    pendingOnboardingsCount: number;
    pendingApprovalsCount: number;
    monthRevenue: number;
  };

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

  // Consultas Rápidas
  getClientByPortalToken: (token: string) => Client | undefined;
  getClientSteps: (clientId: string) => OnboardingStep[];
  getClientTasks: (clientId: string) => Task[];
  getClientApprovals: (clientId: string) => Approval[];

  // Utilidades
  resetToDefaultData: () => void;
  isLoaded: boolean;
}

const TriadeContext = createContext<TriadeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKSPACE: "triade_flow_workspace_v1",
  CLIENTS: "triade_flow_clients_v1",
  STEPS: "triade_flow_steps_v1",
  TASKS: "triade_flow_tasks_v1",
  APPROVALS: "triade_flow_approvals_v1",
  INVOICES: "triade_flow_invoices_v1",
  EXPENSES: "triade_flow_expenses_v1",
};

export const TriadeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(INITIAL_ONBOARDING_STEPS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  // Inicialização com LocalStorage (Fallback Inteligente para rodar imediatamente sem .env)
  useEffect(() => {
    try {
      const savedWs = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      const savedSteps = localStorage.getItem(STORAGE_KEYS.STEPS);
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const savedApprovals = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      const savedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);

      if (savedWs) setWorkspace(JSON.parse(savedWs));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedSteps) setOnboardingSteps(JSON.parse(savedSteps));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedApprovals) setApprovals(JSON.parse(savedApprovals));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
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
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(onboardingSteps));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error("Falha ao salvar no localStorage", e);
    }
  }, [isLoaded, workspace, clients, onboardingSteps, tasks, approvals, invoices, expenses]);

  // CÁLCULO DE MÉTRICAS EXECUTIVAS
  const metrics = useMemo(() => {
    // 1. MRR Ativo (Soma dos clientes ativos com mensalidade)
    const activeMRR = clients
      .filter((c) => c.status === "ativo")
      .reduce((sum, c) => sum + (Number(c.monthly_fee) || 0), 0);

    // 2. Projetos em Andamento (tasks em todo, in_progress ou review)
    const ongoingProjectsCount = tasks.filter((t) => t.status !== "done").length;

    // 3. Onboardings Pendentes (Clientes em status onboarding ou com steps não aprovados)
    const pendingOnboardingsCount = clients.filter((c) => c.status === "onboarding").length;

    // 4. Aprovações Aguardando Cliente
    const pendingApprovalsCount = approvals.filter(
      (a) => a.status === "pendente" || a.status === "solicitado_ajustes"
    ).length;

    // 5. Faturamento do Mês (Faturas pagas ou faturadas no ciclo atual)
    const monthRevenue = invoices
      .filter((inv) => inv.status === "pago")
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    return {
      activeMRR,
      ongoingProjectsCount,
      pendingOnboardingsCount,
      pendingApprovalsCount,
      monthRevenue,
    };
  }, [clients, tasks, approvals, invoices]);

  /**
   * REGRA CRÍTICA: MOTOR DE ONBOARDING AUTOMÁTICO
   * Gera passos dinâmicos dependendo do tipo de serviço contratado.
   */
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

  // Criação de Cliente com Acionamento do Motor de Onboarding
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
      status: "onboarding", // Todo novo cliente inicia em onboarding
      monthly_fee: clientData.monthly_fee || 0,
      contract_value: clientData.contract_value || 0,
      portal_token: portalToken,
      access_vault: clientData.access_vault || {
        useful_links: [],
      },
      notes: clientData.notes,
      created_at: new Date().toISOString(),
    };

    // Gerar passos automáticos da REGRA CRÍTICA
    const generatedSteps = generateStepsForService(newId, clientData.service_type);

    setClients((prev) => [newClient, ...prev]);
    setOnboardingSteps((prev) => [...prev, ...generatedSteps]);

    // Criar primeira tarefa no Kanban de boas-vindas
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
          access_vault: {
            ...c.access_vault,
            ...vaultUpdates,
          },
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

  // Kanban Tasks Actions
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
      prev.map((t) =>
        t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t
      )
    );
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Consultas por Token e IDs
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

  const resetToDefaultData = () => {
    setWorkspace(INITIAL_WORKSPACE);
    setClients(INITIAL_CLIENTS);
    setOnboardingSteps(INITIAL_ONBOARDING_STEPS);
    setTasks(INITIAL_TASKS);
    setApprovals(INITIAL_APPROVALS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    try {
      localStorage.clear();
    } catch {}
  };

  return (
    <TriadeContext.Provider
      value={{
        workspace,
        clients,
        onboardingSteps,
        tasks,
        approvals,
        invoices,
        expenses,
        metrics,
        addClient,
        updateClient,
        updateAccessVault,
        updateOnboardingStep,
        completeClientStep,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        getClientByPortalToken,
        getClientSteps,
        getClientTasks,
        getClientApprovals,
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
