import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { dbService } from '@/lib/firebase';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('onboarding');
  const [allClients, setAllClients] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais e escutar estado de autenticação
  useEffect(() => {
    let unsubscribe = () => {};

    const loadData = async (user) => {
      try {
        const fetchedClients = await dbService.getClients();
        setAllClients(fetchedClients);
        
        if (user) {
          // No modo de simulação, o id do cliente pode ser obtido do objeto user.clientId ou user.uid
          const targetId = user.clientId || user.uid;
          const matchedClient = fetchedClients.find(c => c.id === targetId);
          setClientData(matchedClient || null);
          if (matchedClient && matchedClient.exibirOnboarding === false) {
            setActiveTab('reports');
          } else {
            setActiveTab('onboarding');
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    // Escuta mudanças de sessão
    unsubscribe = dbService.getCurrentUser((user) => {
      if (!user) {
        router.push('/');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        setCurrentUser(user);
        loadData(user);
      }
    });

    // Escutar eventos de atualização do Banco Mock
    const handleMockUpdate = async () => {
      if (currentUser) {
        const fetchedClients = await dbService.getClients();
        setAllClients(fetchedClients);
        const targetId = currentUser.clientId || currentUser.uid;
        setClientData(fetchedClients.find(c => c.id === targetId) || null);
      }
    };

    window.addEventListener('mock_db_update', handleMockUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('mock_db_update', handleMockUpdate);
    };
  }, [router, currentUser?.uid]);

  const handleLogout = async () => {
    await dbService.logout();
    router.push('/');
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-400">Carregando portal...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{clientData ? `${clientData.nome} | Portal de Onboarding` : 'Portal de Onboarding'}</title>
        <meta name="description" content="Acompanhe o onboarding e gestão do seu restaurante com nossa agência." />
      </Head>

      <div className="min-h-screen flex bg-[#070b13] text-slate-100 overflow-hidden">
        {/* Barra Lateral de Navegação */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          allClients={allClients}
        />

        {/* Área Principal de Conteúdo */}
        <main className="flex-1 overflow-y-auto px-6 pt-20 pb-10 lg:px-12 lg:py-12">
          <div className="max-w-5xl mx-auto">
            <Dashboard 
              clientData={clientData} 
              activeTab={activeTab} 
            />
          </div>
        </main>
      </div>
    </>
  );
}
