import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { dbService } from '@/lib/firebase';
import Sidebar from '@/components/Sidebar';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('admin');
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClientsList = async () => {
    try {
      const fetchedClients = await dbService.getClients();
      setClients(fetchedClients);
    } catch (err) {
      console.error("Erro ao ler lista de clientes:", err);
    }
  };

  const fetchAdminsList = async () => {
    try {
      const fetchedAdmins = await dbService.getAdmins();
      setAdmins(fetchedAdmins);
    } catch (err) {
      console.error("Erro ao ler lista de administradores:", err);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const loadAdminData = async () => {
      await fetchClientsList();
      await fetchAdminsList();
      setLoading(false);
    };

    // Escutar mudanças de autenticação
    unsubscribe = dbService.getCurrentUser((user) => {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setCurrentUser(user);
        loadAdminData();
      }
    });

    // Escutar eventos de atualização do Banco Mock
    const handleMockUpdate = async () => {
      await fetchClientsList();
      await fetchAdminsList();
    };

    window.addEventListener('mock_db_update', handleMockUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('mock_db_update', handleMockUpdate);
    };
  }, [router]);

  const handleLogout = async () => {
    await dbService.logout();
    router.push('/');
  };

  // Callback: Alterar status de etapa (Pendente/Concluido)
  const handleUpdateStepStatus = async (clientId, stepId, currentStatus) => {
    await dbService.toggleStepStatus(clientId, stepId, currentStatus);
    await fetchClientsList();
  };

  // Callback: Salvar passos reorganizados/adicionados
  const handleSaveSteps = async (clientId, steps) => {
    await dbService.saveSteps(clientId, steps);
    await fetchClientsList();
  };

  // Callback: Criar cliente
  const handleCreateClient = async (clientData) => {
    await dbService.createClient(clientData);
    await fetchClientsList();
  };

  // Callback: Editar cliente
  const handleUpdateClient = async (clientId, updatedFields) => {
    await dbService.updateClient(clientId, updatedFields);
    await fetchClientsList();
  };

  // Callback: Excluir cliente
  const handleDeleteClient = async (clientId) => {
    await dbService.deleteClient(clientId);
    await fetchClientsList();
  };

  // Callback: Adicionar Fatura
  const handleAddInvoice = async (clientId, invoice) => {
    await dbService.addInvoice(clientId, invoice);
    await fetchClientsList();
  };

  // Callback: Deletar Fatura
  const handleDeleteInvoice = async (clientId, invoiceId) => {
    await dbService.deleteInvoice(clientId, invoiceId);
    await fetchClientsList();
  };

  // Callback: Adicionar Relatório
  const handleAddReport = async (clientId, report) => {
    await dbService.addReport(clientId, report);
    await fetchClientsList();
  };

  // Callback: Deletar Relatório
  const handleDeleteReport = async (clientId, reportId) => {
    await dbService.deleteReport(clientId, reportId);
    await fetchClientsList();
  };

  // Callback: Criar administrador
  const handleCreateAdmin = async (adminData) => {
    await dbService.createAdmin(adminData);
    await fetchAdminsList();
  };

  // Callback: Deletar administrador
  const handleDeleteAdmin = async (adminId) => {
    try {
      await dbService.deleteAdmin(adminId);
      await fetchAdminsList();
    } catch (err) {
      alert(err.message || "Erro ao excluir administrador");
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-400">Carregando painel admin...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Painel Admin | Gestão de Onboarding</title>
        <meta name="description" content="Área de controle da agência de marketing para acompanhamento de clientes." />
      </Head>

      <div className="min-h-screen flex bg-[#070b13] text-slate-100 overflow-hidden">
        {/* Barra Lateral de Navegação */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          allClients={clients}
        />

        {/* Área Principal de Conteúdo */}
        <main className="flex-1 overflow-y-auto px-6 pt-20 pb-10 lg:px-12 lg:py-12">
          <div className="max-w-5xl mx-auto">
            <AdminPanel
              clients={clients}
              admins={admins}
              onCreateAdmin={handleCreateAdmin}
              onDeleteAdmin={handleDeleteAdmin}
              onUpdateStepStatus={handleUpdateStepStatus}
              onSaveSteps={handleSaveSteps}
              onCreateClient={handleCreateClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onAddInvoice={handleAddInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onAddReport={handleAddReport}
              onDeleteReport={handleDeleteReport}
            />
          </div>
        </main>
      </div>
    </>
  );
}
