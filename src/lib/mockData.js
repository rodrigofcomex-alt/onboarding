// Banco de Dados Simulado (Mock Database) salvo no LocalStorage para testes e demonstração offline.

const INITIAL_CLIENTS = [
  {
    id: "hamburgueria-burger-craft",
    nome: "Burger Craft - Hamburgueria Artesanal",
    email: "contato@burgercraft.com.br",
    responsavel: "Felipe Almeida",
    telefone: "(11) 99876-5432",
    logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop",
    linkFinanceiro: "https://asaas.com/c/exemplo-burger-craft",
    status: "ativo",
    role: "client",
    primeiroAcesso: true,
    senha: "",
    dataCriacao: new Date("2026-05-10T14:30:00Z").toISOString(),
    passos: [
      {
        id: "passo-1",
        macro: "Setup Inicial",
        titulo: "Reunião de Alinhamento e Kickoff",
        descricao: "Agendar e realizar a call de alinhamento estratégico para definir o público-alvo e cronograma.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 1
      },
      {
        id: "passo-2",
        macro: "Setup Inicial",
        titulo: "Briefing de Posicionamento e Cores",
        descricao: "Preencher o formulário detalhado sobre preferências de posicionamento, tom de voz e referências de mercado.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 2
      },
      {
        id: "passo-3",
        macro: "Identidade Visual",
        titulo: "Envio de Fotos dos Pratos e Logotipo",
        descricao: "Enviar as fotos profissionais dos hambúrgueres, logotipo em vetor (.SVG ou .AI) e paleta para o Google Drive compartilhado.",
        status: "Pendente",
        linkAcao: "https://drive.google.com/drive/folders/example-burger-craft",
        textoBotao: "Enviar Arquivos",
        ordem: 3
      },
      {
        id: "passo-4",
        macro: "Identidade Visual",
        titulo: "Aprovação dos Primeiros Templates de Post",
        descricao: "Validar os templates visuais criados pela nossa equipe de design para o feed do Instagram.",
        status: "Pendente",
        linkAcao: "https://trello.com/b/example-craft-approvals",
        textoBotao: "Aprovar Designs",
        ordem: 4
      },
      {
        id: "passo-5",
        macro: "Configuração Técnica",
        titulo: "Acesso ao Gerenciador de Negócios (Meta Ads)",
        descricao: "Conceder acesso de parceiro ou administrador à nossa agência no Meta Business Suite para criação de anúncios.",
        status: "Pendente",
        linkAcao: "https://business.facebook.com/settings",
        textoBotao: "Conceder Acesso",
        ordem: 5
      },
      {
        id: "passo-6",
        macro: "Configuração Técnica",
        titulo: "Instalação do Pixel no Site de Delivery",
        descricao: "Integrar o pixel do Meta Ads e API de Conversão no seu site/cardápio digital (Instadelivery/Labi).",
        status: "Pendente",
        linkAcao: "https://pixel-installation-guide.example.com",
        textoBotao: "Guia de Instalação",
        ordem: 6
      },
      {
        id: "passo-7",
        macro: "Tráfego Pago & Lançamento",
        titulo: "Lançamento das Campanhas de Delivery local",
        descricao: "Publicar as primeiras campanhas focadas em raio de entrega de 5km para aumentar pedidos no WhatsApp/Site.",
        status: "Pendente",
        linkAcao: "",
        textoBotao: "",
        ordem: 7
      }
    ],
    financeiro: [
      {
        id: "fat-01",
        mesRef: "Maio/2026",
        valor: 1650.00,
        vencimento: "2026-05-15",
        status: "Pago",
        linkFatura: "https://example.com/invoice-may-craft.pdf"
      },
      {
        id: "fat-02",
        mesRef: "Junho/2026",
        valor: 1650.00,
        vencimento: "2026-06-15",
        status: "Pendente",
        linkFatura: "https://example.com/invoice-june-craft.pdf"
      }
    ],
    relatorios: [
      {
        id: "rel-01",
        titulo: "Relatório de Tráfego Pago & Envolvimento - Maio/2026",
        mesRef: "Maio/2026",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        dataUpload: new Date("2026-06-02T10:00:00Z").toISOString()
      }
    ]
  },
  {
    id: "kyoto-sushi",
    nome: "Kyoto Sushi Bar - Culinária Japonesa",
    email: "adm@kyotosushi.com.br",
    responsavel: "Paula Sakamoto",
    telefone: "(11) 98888-7777",
    logoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150&h=150&fit=crop",
    linkFinanceiro: "https://iugu.com/c/exemplo-kyoto-sushi",
    status: "ativo",
    role: "client",
    primeiroAcesso: false,
    senha: "123456",
    dataCriacao: new Date("2026-04-01T09:00:00Z").toISOString(),
    passos: [
      {
        id: "passo-1",
        macro: "Setup Inicial",
        titulo: "Reunião de Alinhamento e Kickoff",
        descricao: "Definição do público e orçamento diário.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 1
      },
      {
        id: "passo-2",
        macro: "Setup Inicial",
        titulo: "Briefing de Posicionamento e Cores",
        descricao: "Paleta e direcionamento criativo definidos.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 2
      },
      {
        id: "passo-3",
        macro: "Identidade Visual",
        titulo: "Envio de Fotos dos Pratos e Logotipo",
        descricao: "Logotipo e banco de fotos integrados.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 3
      },
      {
        id: "passo-4",
        macro: "Identidade Visual",
        titulo: "Aprovação dos Primeiros Templates de Post",
        descricao: "Feed aprovado e programado.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 4
      },
      {
        id: "passo-5",
        macro: "Configuração Técnica",
        titulo: "Acesso ao Gerenciador de Negócios (Meta Ads)",
        descricao: "Contas de anúncios vinculadas.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 5
      },
      {
        id: "passo-6",
        macro: "Configuração Técnica",
        titulo: "Instalação do Pixel no Site de Delivery",
        descricao: "Rastreamento completo configurado no site de delivery.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 6
      },
      {
        id: "passo-7",
        macro: "Tráfego Pago & Lançamento",
        titulo: "Lançamento das Campanhas de Delivery local",
        descricao: "Campanhas ativas gerando leads e pedidos recorrentes.",
        status: "Concluido",
        linkAcao: "",
        textoBotao: "",
        ordem: 7
      }
    ],
    financeiro: [
      {
        id: "fat-03",
        mesRef: "Abril/2026",
        valor: 2000.00,
        vencimento: "2026-04-10",
        status: "Pago",
        linkFatura: "https://example.com/invoice-apr-kyoto.pdf"
      },
      {
        id: "fat-04",
        mesRef: "Maio/2026",
        valor: 2000.00,
        vencimento: "2026-05-10",
        status: "Pago",
        linkFatura: "https://example.com/invoice-may-kyoto.pdf"
      },
      {
        id: "fat-05",
        mesRef: "Junho/2026",
        valor: 2000.00,
        vencimento: "2026-06-10",
        status: "Pago",
        linkFatura: "https://example.com/invoice-june-kyoto.pdf"
      }
    ],
    relatorios: [
      {
        id: "rel-02",
        titulo: "Relatório Mensal de Performance - Abril/2026",
        mesRef: "Abril/2026",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        dataUpload: new Date("2026-05-02T11:00:00Z").toISOString()
      },
      {
        id: "rel-03",
        titulo: "Relatório Mensal de Performance - Maio/2026",
        mesRef: "Maio/2026",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        dataUpload: new Date("2026-06-03T09:30:00Z").toISOString()
      }
    ]
  }
];

// Helper para inicializar dados na primeira execução
const initializeMockData = () => {
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('portal_marketing_clients');
    if (!existing) {
      localStorage.setItem('portal_marketing_clients', JSON.stringify(INITIAL_CLIENTS));
    } else {
      try {
        const parsed = JSON.parse(existing);
        const needsReset = parsed.some(c => c.primeiroAcesso === undefined);
        if (needsReset) {
          localStorage.setItem('portal_marketing_clients', JSON.stringify(INITIAL_CLIENTS));
          console.log("⚡ Simulador atualizado: Mock data resetado para suporte a Primeiro Acesso.");
        }
      } catch (e) {
        localStorage.setItem('portal_marketing_clients', JSON.stringify(INITIAL_CLIENTS));
      }
    }
  }
};

export const getMockClients = () => {
  initializeMockData();
  if (typeof window === 'undefined') return INITIAL_CLIENTS;
  const data = localStorage.getItem('portal_marketing_clients');
  return data ? JSON.parse(data) : INITIAL_CLIENTS;
};

export const saveMockClients = (clients) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portal_marketing_clients', JSON.stringify(clients));
    window.dispatchEvent(new Event('mock_db_update')); // Notifica componentes ativos
  }
};

// CRUD: Criar Cliente
export const createMockClient = (clientData) => {
  const clients = getMockClients();
  const hasPassword = clientData.senha && clientData.senha.trim() !== "";
  const newClient = {
    ...clientData,
    id: clientData.id || `cli-${Math.random().toString(36).substr(2, 9)}`,
    primeiroAcesso: !hasPassword,
    senha: hasPassword ? clientData.senha : "",
    exibirOnboarding: clientData.exibirOnboarding !== false,
    dataCriacao: new Date().toISOString(),
    passos: clientData.passos || [
      { id: "p1", macro: "Setup Inicial", titulo: "Reunião de Kickoff", descricao: "Alinhamento com a equipe.", status: "Pendente", linkAcao: "", textoBotao: "", ordem: 1 },
      { id: "p2", macro: "Identidade Visual", titulo: "Envio de Fotos do Menu", descricao: "Fazer upload do portfólio visual.", status: "Pendente", linkAcao: "", textoBotao: "", ordem: 2 },
      { id: "p3", macro: "Configuração Técnica", titulo: "Acesso às Contas de Anúncio", descricao: "Liberar acesso no Meta Ads.", status: "Pendente", linkAcao: "", textoBotao: "", ordem: 3 }
    ],
    financeiro: [],
    relatorios: []
  };
  clients.push(newClient);
  saveMockClients(clients);
  return newClient;
};

// CRUD: Atualizar Cliente
export const updateMockClient = (clientId, updatedFields) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      const hasPassword = updatedFields.senha && updatedFields.senha.trim() !== "";
      return { 
        ...client, 
        ...updatedFields,
        // Se o admin editou a senha, removemos a flag de primeiro acesso
        primeiroAcesso: hasPassword ? false : client.primeiroAcesso
      };
    }
    return client;
  });
  saveMockClients(updatedClients);
  return updatedClients.find(c => c.id === clientId);
};

// CRUD: Deletar Cliente (ou desativar)
export const deleteMockClient = (clientId) => {
  const clients = getMockClients();
  const filteredClients = clients.filter(client => client.id !== clientId);
  saveMockClients(filteredClients);
  return filteredClients;
};

// Toggle de Status dos Passos (Pendente/Concluido)
export const toggleMockStepStatus = (clientId, stepId) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      const updatedPassos = client.passos.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: step.status === "Concluido" ? "Pendente" : "Concluido"
          };
        }
        return step;
      });
      return { ...client, passos: updatedPassos };
    }
    return client;
  });
  saveMockClients(updatedClients);
};

// Atualizar passos do board (Adicionar/Editar/Excluir micro passos)
export const saveMockSteps = (clientId, steps) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      return { ...client, passos: steps };
    }
    return client;
  });
  saveMockClients(updatedClients);
};

// Adicionar Fatura
export const addMockInvoice = (clientId, invoice) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      const newInvoice = {
        ...invoice,
        id: `fat-${Math.random().toString(36).substr(2, 9)}`,
      };
      return {
        ...client,
        financeiro: [...(client.financeiro || []), newInvoice]
      };
    }
    return client;
  });
  saveMockClients(updatedClients);
};

// Excluir Fatura
export const deleteMockInvoice = (clientId, invoiceId) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      return {
        ...client,
        financeiro: (client.financeiro || []).filter(f => f.id !== invoiceId)
      };
    }
    return client;
  });
  saveMockClients(updatedClients);
};

// Adicionar Relatório
export const addMockReport = (clientId, report) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      const newReport = {
        ...report,
        id: `rel-${Math.random().toString(36).substr(2, 9)}`,
        dataUpload: new Date().toISOString()
      };
      return {
        ...client,
        relatorios: [...(client.relatorios || []), newReport]
      };
    }
    return client;
  });
  saveMockClients(updatedClients);
};

// Excluir Relatório
export const deleteMockReport = (clientId, reportId) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.id === clientId) {
      return {
        ...client,
        relatorios: (client.relatorios || []).filter(r => r.id !== reportId)
      };
    }
    return client;
  });
  saveMockClients(updatedClients);
};

export const checkMockEmailStatus = (email) => {
  const admins = getMockAdmins();
  if (admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    return { exists: true, role: 'admin', primeiroAcesso: false };
  }
  const clients = getMockClients();
  const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (client) {
    return { exists: true, role: 'client', primeiroAcesso: client.primeiroAcesso };
  }
  return { exists: false };
};

export const registerMockFirstAccess = (email, password) => {
  const clients = getMockClients();
  const updatedClients = clients.map(client => {
    if (client.email === email) {
      return {
        ...client,
        senha: password,
        primeiroAcesso: false
      };
    }
    return client;
  });
  saveMockClients(updatedClients);
  const client = updatedClients.find(c => c.email === email);
  const user = { uid: client.id, email, role: "client", clientId: client.id };
  localStorage.setItem("portal_session", JSON.stringify(user));
  return user;
};

// =======================================================
// GESTÃO DE ADMINISTRADORES (MOCK)
// =======================================================

const initializeMockAdmins = () => {
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('portal_marketing_admins');
    if (!existing) {
      localStorage.setItem('portal_marketing_admins', JSON.stringify([
        { email: "comercial1.emphasis@gmail.com", senha: "12Rod34#", nome: "Comercial Emphasis" },
        { email: "mesocialmedia16@gmail.com", senha: "Casa920125#", nome: "Social Media" }
      ]));
    }
  }
};

export const getMockAdmins = () => {
  initializeMockAdmins();
  if (typeof window === 'undefined') {
    return [
      { email: "comercial1.emphasis@gmail.com", senha: "12Rod34#", nome: "Comercial Emphasis" },
      { email: "mesocialmedia16@gmail.com", senha: "Casa920125#", nome: "Social Media" }
    ];
  }
  const data = localStorage.getItem('portal_marketing_admins');
  return data ? JSON.parse(data) : [];
};

export const saveMockAdmins = (admins) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portal_marketing_admins', JSON.stringify(admins));
    window.dispatchEvent(new Event('mock_db_update'));
  }
};

export const createMockAdmin = (adminData) => {
  const admins = getMockAdmins();
  if (admins.some(a => a.email.toLowerCase() === adminData.email.toLowerCase())) {
    throw new Error("Este e-mail de administrador já está cadastrado.");
  }
  const newAdmin = {
    ...adminData,
    id: adminData.id || `adm-${Math.random().toString(36).substr(2, 9)}`,
    email: adminData.email.toLowerCase().trim()
  };
  admins.push(newAdmin);
  saveMockAdmins(admins);
  return newAdmin;
};

export const deleteMockAdmin = (adminEmailOrId) => {
  const defaultEmails = ["comercial1.emphasis@gmail.com", "mesocialmedia16@gmail.com"];
  const searchKey = adminEmailOrId.toLowerCase().trim();
  if (defaultEmails.includes(searchKey)) {
    throw new Error("Não é possível excluir um administrador padrão.");
  }
  
  let admins = getMockAdmins();
  admins = admins.filter(a => a.email.toLowerCase() !== searchKey && a.id !== adminEmailOrId);
  saveMockAdmins(admins);
  return admins;
};
