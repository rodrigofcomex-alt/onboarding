import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Layers, 
  UserPlus, 
  Eye, 
  Save, 
  X,
  UploadCloud,
  Loader2,
  ListOrdered,
  ExternalLink,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminPanel({ 
  clients, 
  admins = [],
  onCreateAdmin,
  onDeleteAdmin,
  onUpdateStepStatus, 
  onSaveSteps,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  onAddInvoice,
  onDeleteInvoice,
  onAddReport,
  onDeleteReport
}) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [adminTab, setAdminTab] = useState('clients'); // 'clients' | 'board' | 'content'

  // Estados para formulários
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [clientForm, setClientForm] = useState({
    id: '', nome: '', email: '', responsavel: '', telefone: '', status: 'ativo', logoUrl: '', linkFinanceiro: '', senha: '', exibirOnboarding: true
  });

  // Estados para Gestão de Passos do Board
  const [isStepFormOpen, setIsStepFormOpen] = useState(false);
  const [stepFormMode, setStepFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedStepId, setSelectedStepId] = useState('');
  const [stepForm, setStepForm] = useState({
    macro: 'Setup Inicial', titulo: '', descricao: '', status: 'Pendente', linkAcao: '', textoBotao: '', ordem: 1
  });

  // Estados para novas faturas/relatórios
  const [invoiceForm, setInvoiceForm] = useState({ mesRef: '', valor: '', vencimento: '', status: 'Pendente', linkFatura: '' });
  const [reportForm, setReportForm] = useState({ titulo: '', mesRef: '', url: '' });
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estados para Gestão de Admins
  const [newAdminForm, setNewAdminForm] = useState({ nome: '', email: '', senha: '' });
  const [adminFormError, setAdminFormError] = useState('');

  // Estados para Gestão de Macros
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [tempMacrosOrdem, setTempMacrosOrdem] = useState([]);
  const [newMacroName, setNewMacroName] = useState('');

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const getOrderedMacros = (client) => {
    if (!client) return [];
    const defaultMacros = ["Setup Inicial", "Identidade Visual", "Configuração Técnica", "Tráfego Pago & Lançamento"];
    let order = [...(client.macrosOrdem || defaultMacros)];
    
    const stepsMacros = Array.from(new Set(client.passos?.map(s => s.macro) || []));
    stepsMacros.forEach(macro => {
      if (!order.includes(macro)) {
        order.push(macro);
      }
    });
    
    return order;
  };

  const uniqueMacros = getOrderedMacros(selectedClient);

  const sortedStepsForAdmin = [...(selectedClient?.passos || [])].sort((a, b) => {
    const aMacroIndex = uniqueMacros.indexOf(a.macro);
    const bMacroIndex = uniqueMacros.indexOf(b.macro);
    if (aMacroIndex !== bMacroIndex) {
      return aMacroIndex - bMacroIndex;
    }
    return a.ordem - b.ordem;
  });

  const handleOpenClientModal = (mode, client = null) => {
    setModalMode(mode);
    if (mode === 'edit' && client) {
      setClientForm({
        id: client.id,
        nome: client.nome,
        email: client.email,
        responsavel: client.responsavel,
        telefone: client.telefone,
        status: client.status,
        logoUrl: client.logoUrl || '',
        linkFinanceiro: client.linkFinanceiro || '',
        senha: client.senha || '',
        exibirOnboarding: client.exibirOnboarding !== false
      });
    } else {
      setClientForm({
        id: '', nome: '', email: '', responsavel: '', telefone: '', status: 'ativo', logoUrl: '', linkFinanceiro: '', senha: '', exibirOnboarding: true
      });
    }
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const generatedId = clientForm.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      onCreateClient({ ...clientForm, id: generatedId });
      if (!selectedClientId) setSelectedClientId(generatedId);
    } else {
      onUpdateClient(clientForm.id, clientForm);
    }
    setIsClientModalOpen(false);
  };

  // Gestão de Passos
  const handleOpenStepModal = (mode, step = null) => {
    setStepFormMode(mode);
    if (mode === 'edit' && step) {
      setSelectedStepId(step.id);
      setStepForm({
        macro: step.macro,
        titulo: step.titulo,
        descricao: step.descricao,
        status: step.status,
        linkAcao: step.linkAcao || '',
        textoBotao: step.textoBotao || '',
        ordem: step.ordem || 1
      });
    } else {
      const nextOrdem = selectedClient ? (selectedClient.passos?.length || 0) + 1 : 1;
      setStepForm({
        macro: 'Setup Inicial',
        titulo: '',
        descricao: '',
        status: 'Pendente',
        linkAcao: '',
        textoBotao: '',
        ordem: nextOrdem
      });
    }
    setIsStepFormOpen(true);
  };

  const handleSaveStep = (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    let updatedSteps = [...(selectedClient.passos || [])];

    if (stepFormMode === 'create') {
      const newStep = {
        ...stepForm,
        id: `passo-${Date.now()}`,
        ordem: Number(stepForm.ordem)
      };
      updatedSteps.push(newStep);
    } else {
      updatedSteps = updatedSteps.map(s => {
        if (s.id === selectedStepId) {
          return { ...s, ...stepForm, ordem: Number(stepForm.ordem) };
        }
        return s;
      });
    }

    // Ordenar passos
    updatedSteps.sort((a, b) => a.ordem - b.ordem);
    onSaveSteps(selectedClient.id, updatedSteps);
    setIsStepFormOpen(false);
  };

  const handleDeleteStep = (stepId) => {
    if (!selectedClient || !confirm("Tem certeza que deseja excluir esta etapa?")) return;
    const updatedSteps = selectedClient.passos.filter(s => s.id !== stepId);
    onSaveSteps(selectedClient.id, updatedSteps);
  };

  const handleOpenMacroModal = () => {
    setTempMacrosOrdem(getOrderedMacros(selectedClient));
    setNewMacroName('');
    setIsMacroModalOpen(true);
  };

  const handleMoveMacroUp = (index) => {
    if (index === 0) return;
    const list = [...tempMacrosOrdem];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setTempMacrosOrdem(list);
  };

  const handleMoveMacroDown = (index) => {
    if (index === tempMacrosOrdem.length - 1) return;
    const list = [...tempMacrosOrdem];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setTempMacrosOrdem(list);
  };

  const handleAddMacroName = () => {
    if (!newMacroName.trim()) return;
    const trimmed = newMacroName.trim();
    if (tempMacrosOrdem.includes(trimmed)) {
      alert("Esta macro já existe na lista.");
      return;
    }
    setTempMacrosOrdem([...tempMacrosOrdem, trimmed]);
    setNewMacroName('');
  };

  const handleRemoveMacroName = (macroName) => {
    if (confirm(`Remover "${macroName}" da lista de ordem? As etapas pertencentes a esta macro não serão excluídas, mas voltarão para o fim da fila.`)) {
      setTempMacrosOrdem(tempMacrosOrdem.filter(m => m !== macroName));
    }
  };

  const handleSaveMacroOrdem = async () => {
    if (!selectedClient) return;
    await onUpdateClient(selectedClient.id, { macrosOrdem: tempMacrosOrdem });
    setIsMacroModalOpen(false);
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminFormError('');
    
    if (newAdminForm.senha.length < 6) {
      setAdminFormError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    
    try {
      await onCreateAdmin(newAdminForm);
      setNewAdminForm({ nome: '', email: '', senha: '' });
    } catch (err) {
      setAdminFormError(err.message || 'Erro ao criar administrador.');
    }
  };

  // Adicionar Fatura
  const handleAddInvoice = (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    onAddInvoice(selectedClient.id, {
      ...invoiceForm,
      valor: parseFloat(invoiceForm.valor)
    });
    setInvoiceForm({ mesRef: '', valor: '', vencimento: '', status: 'Pendente', linkFatura: '' });
  };

  // Adicionar Relatório com Simulação de Upload para Storage
  const handleAddReport = (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    // Simular upload de arquivo para o storage
    setUploadingReport(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onAddReport(selectedClient.id, {
              ...reportForm,
              url: reportForm.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            });
            setReportForm({ titulo: '', mesRef: '', url: '' });
            setUploadingReport(false);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Seção Superior - Seletor de Cliente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Painel Administrativo</span>
          <h2 className="text-2xl font-display font-bold text-white">Central de Clientes</h2>
          <p className="text-sm text-slate-400">Gerencie contas, acompanhe progressos, envie relatórios e faturas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="appearance-none bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-amber-500/50 w-full sm:w-64 cursor-pointer font-medium"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.status})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <Layers size={14} />
            </div>
          </div>

          <button
            onClick={() => handleOpenClientModal('create')}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-600/10 active:scale-95"
          >
            <UserPlus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Tabs Internas Administrativas */}
      <div className="flex border-b border-white/5 gap-6 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setAdminTab('clients')}
          className={`pb-4 font-semibold transition-colors relative ${
            adminTab === 'clients' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Dados Cadastrais
          {adminTab === 'clients' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
        </button>
        <button
          onClick={() => setAdminTab('board')}
          className={`pb-4 font-semibold transition-colors relative ${
            adminTab === 'board' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mapa de Bordo (Onboarding)
          {adminTab === 'board' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
        </button>
        <button
          onClick={() => setAdminTab('content')}
          className={`pb-4 font-semibold transition-colors relative ${
            adminTab === 'content' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Relatórios
          {adminTab === 'content' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
        </button>
        <button
          onClick={() => setAdminTab('admins')}
          className={`pb-4 font-semibold transition-colors relative ${
            adminTab === 'admins' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Administradores
          {adminTab === 'admins' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
        </button>
      </div>

      {/* CONTEÚDO TAB: CADASTRO CLIENTE */}
      {adminTab === 'clients' && selectedClient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/2 border border-white/5 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Ficha de Cadastro</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenClientModal('edit', selectedClient)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Editar dados"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza de que deseja deletar permanentemente o cliente "${selectedClient.nome}"?`)) {
                      onDeleteClient(selectedClient.id);
                      setSelectedClientId(clients.find(c => c.id !== selectedClient.id)?.id || '');
                    }
                  }}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Remover cliente"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Nome do Restaurante</span>
                <span className="text-white text-base font-semibold">{selectedClient.nome}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Responsável</span>
                <span className="text-white text-base font-semibold">{selectedClient.responsavel}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">E-mail de Login</span>
                <span className="text-white text-base font-mono">{selectedClient.email}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Telefone (WhatsApp)</span>
                <span className="text-white text-base">{selectedClient.telefone}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Status de Acesso</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 border ${
                  selectedClient.status === 'ativo' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {selectedClient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Mapa de Bordo</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 border ${
                  selectedClient.exibirOnboarding !== false
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border-white/5'
                }`}>
                  {selectedClient.exibirOnboarding !== false ? 'Visível' : 'Ocultado'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Senha de Acesso</span>
                <span className="text-white text-base font-mono block mt-1">
                  {selectedClient.senha ? (
                    <span className="font-semibold text-white">{selectedClient.senha}</span>
                  ) : (
                    <span className="text-amber-500/80 italic text-xs">Pendente (Primeiro Acesso)</span>
                  )}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-500 text-xs uppercase block font-semibold">Link do Financeiro Externo</span>
                {selectedClient.linkFinanceiro ? (
                  <a 
                    href={selectedClient.linkFinanceiro} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 text-sm font-semibold flex items-center gap-1.5 mt-1"
                  >
                    {selectedClient.linkFinanceiro}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-slate-500 text-sm italic mt-1 block">Nenhum link configurado</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block font-semibold">Data de Criação</span>
                <span className="text-slate-300 text-sm">
                  {new Date(selectedClient.dataCriacao).toLocaleDateString('pt-BR')} às {new Date(selectedClient.dataCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">Logo Visualizado</div>
            {selectedClient.logoUrl ? (
              <img 
                src={selectedClient.logoUrl} 
                alt="Logo" 
                className="w-32 h-32 rounded-3xl object-cover border border-white/10 shadow-lg" 
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center border border-white/5">
                <Layers size={40} className="text-slate-600" />
              </div>
            )}
            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
              O logotipo do restaurante aparecerá no topo do painel quando o cliente fizer o acesso.
            </p>
          </div>
        </div>
      )}

      {/* CONTEÚDO TAB: GERENCIADOR DO BOARD */}
      {adminTab === 'board' && selectedClient && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Etapas de Progresso (Checklist)</h3>
              <p className="text-xs text-slate-400">Altere o status para concluído em tempo real ou organize os micro passos.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleOpenMacroModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all duration-200 active:scale-95 shadow-md"
              >
                <ListOrdered size={14} /> Gerenciar Macros
              </button>
              <button
                onClick={() => handleOpenStepModal('create')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all duration-200 active:scale-95 shadow-md shadow-amber-500/10"
              >
                <Plus size={14} /> Adicionar Micro Passo
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sortedStepsForAdmin && sortedStepsForAdmin.length > 0 ? (
              sortedStepsForAdmin.map((step) => {
                const isDone = step.status === 'Concluido';
                return (
                  <div 
                    key={step.id} 
                    className={`
                      p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all
                      ${isDone ? 'bg-emerald-950/5 border-emerald-500/10' : 'bg-white/2 border-white/5'}
                    `}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button 
                        onClick={() => onUpdateStepStatus(selectedClient.id, step.id, step.status)}
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 mt-0.5 ${
                          isDone 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-slate-800 border-white/10 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isDone ? "Marcar como Pendente" : "Marcar como Concluído"}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </button>
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded">
                            {step.macro}
                          </span>
                          <span className="text-slate-500">Ordem: {step.ordem}</span>
                          {step.linkAcao && (
                            <span className="text-amber-500 font-semibold truncate max-w-[150px]">
                              Ação: {step.textoBotao || "Ir"} ({step.linkAcao})
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white leading-tight">{step.titulo}</h4>
                        <p className="text-xs text-slate-400 leading-normal">{step.descricao}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-none border-white/5">
                      <button
                        onClick={() => handleOpenStepModal('edit', step)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-slate-500 rounded-xl border border-white/5 bg-slate-950/10">
                Nenhum passo de onboarding cadastrado para este cliente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO TAB: RELATÓRIOS */}
      {adminTab === 'content' && selectedClient && (
        <div className="max-w-3xl mx-auto">
          
          {/* LADO RELATÓRIOS */}
          <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                Relatórios de Performance
              </h3>
              <p className="text-xs text-slate-400">Vincule relatórios em PDF para este cliente específico.</p>
            </div>

            {/* Formulário Relatórios */}
            <form onSubmit={handleAddReport} className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/20 border border-white/5">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Título do Relatório</label>
                <input 
                  type="text" 
                  value={reportForm.titulo}
                  onChange={(e) => setReportForm({...reportForm, titulo: e.target.value})}
                  placeholder="Ex: Performance Anúncios - Junho/2026"
                  required
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mês de Referência</label>
                <input 
                  type="text" 
                  value={reportForm.mesRef}
                  onChange={(e) => setReportForm({...reportForm, mesRef: e.target.value})}
                  placeholder="Ex: Junho/2026"
                  required
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Link PDF (Firestore/Storage/Drive)</label>
                <input 
                  type="url" 
                  value={reportForm.url}
                  onChange={(e) => setReportForm({...reportForm, url: e.target.value})}
                  placeholder="Ex: https://storage.google.com/relatorio.pdf"
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={uploadingReport}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-xs transition-colors"
                >
                  {uploadingReport ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> 
                      Simulando Upload para Storage ({uploadProgress}%)
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} /> Carregar Relatório (PDF)
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Listagem Relatórios */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {selectedClient.relatorios && selectedClient.relatorios.length > 0 ? (
                selectedClient.relatorios.map((rel) => (
                  <div key={rel.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-white">{rel.titulo}</p>
                      <p className="text-[10px] text-slate-400">Ref: {rel.mesRef} • Upload: {new Date(rel.dataUpload).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja deletar este relatório?")) {
                          onDeleteReport(selectedClient.id, rel.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded bg-red-500/5 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-6 text-xs">Nenhum relatório cadastrado.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO TAB: ADMINISTRADORES */}
      {adminTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Admins */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/2 border border-white/5 space-y-6">
            <div className="pb-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Lista de Administradores</h3>
              <p className="text-xs text-slate-400 mt-1">Usuários com permissão para gerenciar clientes, etapas e relatórios.</p>
            </div>
            
            <div className="space-y-3">
              {admins.map((adm, idx) => (
                <div key={adm.id || adm.email || idx} className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{adm.nome || 'Administrador'}</p>
                    <p className="text-xs text-slate-400 font-mono">{adm.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                      Acesso Total
                    </span>
                    {!["comercial1.emphasis@gmail.com", "mesocialmedia16@gmail.com"].includes(adm.email?.toLowerCase().trim()) && (
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja remover as permissões do administrador "${adm.nome || adm.email}"?`)) {
                            onDeleteAdmin(adm.id || adm.email);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Excluir Administrador"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário Novo Admin */}
          <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-6 h-fit">
            <div className="pb-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-1.5">
                <UserPlus size={18} className="text-indigo-400" />
                Adicionar Administrador
              </h3>
              <p className="text-xs text-slate-400 mt-1">Crie um novo login com permissões administrativas.</p>
            </div>

            {adminFormError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {adminFormError}
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome / Cargo</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.nome}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, nome: e.target.value })}
                  placeholder="Ex: Comercial Emphasis"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 font-semibold mb-1">E-mail (Login)</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="Ex: comercial2@gmail.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Senha (Mín. 6 caracteres)</label>
                <input
                  type="password"
                  required
                  value={newAdminForm.senha}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, senha: e.target.value })}
                  placeholder="Senha de acesso..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus size={14} /> Registrar Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: CADASTRO/EDIÇÃO DE CLIENTE (CRUD)
          ======================================================= */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 animate-slide-up space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">
                {modalMode === 'create' ? 'Adicionar Novo Cliente' : 'Editar Dados Cadastrais'}
              </h3>
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Nome do Restaurante</label>
                  <input
                    type="text"
                    value={clientForm.nome}
                    onChange={(e) => setClientForm({ ...clientForm, nome: e.target.value })}
                    required
                    placeholder="Ex: Kyoto Sushi Bar"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Nome do Responsável</label>
                  <input
                    type="text"
                    value={clientForm.responsavel}
                    onChange={(e) => setClientForm({ ...clientForm, responsavel: e.target.value })}
                    required
                    placeholder="Ex: Paula Sakamoto"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">WhatsApp de Contato</label>
                  <input
                    type="text"
                    value={clientForm.telefone}
                    onChange={(e) => setClientForm({ ...clientForm, telefone: e.target.value })}
                    required
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">E-mail de Cadastro (Login)</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    required
                    disabled={modalMode === 'edit'}
                    placeholder="Ex: adm@kyoto.com.br"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-55"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">URL da Logomarca (Opcional)</label>
                  <input
                    type="url"
                    value={clientForm.logoUrl}
                    onChange={(e) => setClientForm({ ...clientForm, logoUrl: e.target.value })}
                    placeholder="Ex: https://images.unsplash.com/... (ou deixe vazio para padrão)"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Link do Financeiro Externo</label>
                  <input
                    type="url"
                    value={clientForm.linkFinanceiro}
                    onChange={(e) => setClientForm({ ...clientForm, linkFinanceiro: e.target.value })}
                    placeholder="Ex: https://asaas.com/c/cliente-id"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Status de Acesso</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="ativo">Ativo (Acesso Liberado)</option>
                    <option value="inativo">Inativo (Acesso Suspenso)</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Senha de Acesso (Opcional)</label>
                  <input
                    type="text"
                    value={clientForm.senha}
                    onChange={(e) => setClientForm({ ...clientForm, senha: e.target.value })}
                    placeholder="Deixe em branco para 1º acesso"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={clientForm.exibirOnboarding !== false}
                      onChange={(e) => setClientForm({ ...clientForm, exibirOnboarding: e.target.checked })}
                      className="w-4 h-4 mt-0.5 text-amber-500 bg-slate-900 border-white/10 rounded focus:ring-amber-500 focus:ring-opacity-25 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="block text-xs font-semibold text-white">Exibir Mapa de Bordo no Painel do Cliente</span>
                      <span className="block text-[10px] text-slate-400 leading-normal">Se desmarcado, a aba "Mapa de Bordo" é removida da barra lateral dele e a aba "Relatórios" se torna a principal dele.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Save size={14} /> Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: ADICIONAR/EDITAR MICRO PASSO (BOARD)
          ======================================================= */}
      {isStepFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 animate-slide-up space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">
                {stepFormMode === 'create' ? 'Adicionar Novo Passo ao Onboarding' : 'Editar Etapa do Onboarding'}
              </h3>
              <button 
                onClick={() => setIsStepFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Macro Passo (Grupo)</label>
                  <input
                    type="text"
                    value={stepForm.macro}
                    onChange={(e) => setStepForm({ ...stepForm, macro: e.target.value })}
                    list="macro-suggestions"
                    placeholder="Ex: Setup Inicial"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="macro-suggestions">
                    {uniqueMacros.map(macro => (
                      <option key={macro} value={macro} />
                    ))}
                  </datalist>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={stepForm.ordem}
                    onChange={(e) => setStepForm({ ...stepForm, ordem: e.target.value })}
                    required
                    min="1"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Título do Micro Passo</label>
                  <input
                    type="text"
                    value={stepForm.titulo}
                    onChange={(e) => setStepForm({ ...stepForm, titulo: e.target.value })}
                    required
                    placeholder="Ex: Enviar Fotos de Alta Qualidade do Menu"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Descrição Técnica / Instruções</label>
                  <textarea
                    value={stepForm.descricao}
                    onChange={(e) => setStepForm({ ...stepForm, descricao: e.target.value })}
                    required
                    rows="3"
                    placeholder="Oriente o cliente sobre as especificações e o que deve fazer."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Status Inicial</label>
                  <select
                    value={stepForm.status}
                    onChange={(e) => setStepForm({ ...stepForm, status: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Concluido">Concluído</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Texto do Botão de Ação (Opcional)</label>
                  <input
                    type="text"
                    value={stepForm.textoBotao}
                    onChange={(e) => setStepForm({ ...stepForm, textoBotao: e.target.value })}
                    placeholder="Ex: Enviar Fotos"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Link de Ação / Redirecionamento (Opcional)</label>
                  <input
                    type="url"
                    value={stepForm.linkAcao}
                    onChange={(e) => setStepForm({ ...stepForm, linkAcao: e.target.value })}
                    placeholder="Ex: https://drive.google.com/..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsStepFormOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Save size={14} /> Salvar Etapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: GERENCIAR MACROS E ORDENAÇÃO
          ======================================================= */}
      {isMacroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 animate-slide-up space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListOrdered size={20} className="text-amber-500" />
                Gerenciar Macro Passos
              </h3>
              <button 
                onClick={() => setIsMacroModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Adicione novos grupos macro ou reordene-os para definir quem aparece primeiro na timeline de bordo do cliente.
              </p>

              {/* Criar Nova Macro */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMacroName}
                  onChange={(e) => setNewMacroName(e.target.value)}
                  placeholder="Nome do novo macro passo..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddMacroName}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              {/* Listagem de Macros */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {tempMacrosOrdem.length > 0 ? (
                  tempMacrosOrdem.map((macro, index) => (
                    <div 
                      key={macro} 
                      className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between gap-4"
                    >
                      <span className="font-semibold text-white text-sm truncate">{macro}</span>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Botão Subir */}
                        <button
                          type="button"
                          onClick={() => handleMoveMacroUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Subir"
                        >
                          <ArrowUp size={14} />
                        </button>

                        {/* Botão Descer */}
                        <button
                          type="button"
                          onClick={() => handleMoveMacroDown(index)}
                          disabled={index === tempMacrosOrdem.length - 1}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Descer"
                        >
                          <ArrowDown size={14} />
                        </button>

                        {/* Botão Remover */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMacroName(macro)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Remover da ordem"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-6">Nenhum macro passo cadastrado.</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsMacroModalOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMacroOrdem}
                className="px-4 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
              >
                <Save size={14} /> Salvar Ordenação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
