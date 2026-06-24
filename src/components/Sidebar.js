import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  allClients = []
}) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'onboarding', label: 'Mapa de Bordo', icon: LayoutDashboard, roles: ['client', 'admin'] },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: ['client'] },
    { id: 'reports', label: 'Relatórios', icon: FileText, roles: ['client'] },
    { id: 'admin', label: 'Painel Admin', icon: Settings, roles: ['admin'] },
  ];

  const currentClient = currentUser?.role !== 'admin' 
    ? allClients.find(c => c.id === (currentUser?.clientId || currentUser?.uid))
    : null;

  const filteredMenu = menuItems.filter(item => {
    if (!currentUser) return false;
    if (!item.roles.includes(currentUser.role)) return false;
    if (item.id === 'onboarding' && currentUser.role === 'client') {
      if (currentClient && currentClient.exibirOnboarding === false) {
        return false;
      }
    }
    return true;
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Determinar nome a exibir no topo
  const displayName = currentUser?.role === 'admin' 
    ? 'Agência Marketing' 
    : (currentClient?.nome || 'Portal do Cliente');

  const displaySubtitle = currentUser?.role === 'admin'
    ? 'Painel Administrativo'
    : 'Portal de Onboarding';

  const userEmail = currentUser?.email || '';

  return (
    <>
      {/* Botão Hamburger para Mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleSidebar} 
          className="p-2.5 rounded-xl glass-panel text-amber-500 hover:text-amber-400 transition-colors focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay do Menu Mobile */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
        />
      )}

      {/* Container da Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 glass-panel z-40 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex lg:flex-col lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Sparkles className="text-white w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white leading-tight tracking-wide">
                {displayName}
              </h1>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                {currentUser?.role === 'admin' && <ShieldCheck size={12} className="text-amber-500" />}
                {displaySubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'finance') {
                    const currentClient = allClients.find(c => c.id === currentUser?.clientId);
                    if (currentClient?.linkFinanceiro) {
                      window.open(currentClient.linkFinanceiro, '_blank');
                      setIsOpen(false);
                      return;
                    }
                  }
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'finance' && allClients.find(c => c.id === currentUser?.clientId)?.linkFinanceiro && (
                  <ExternalLink size={12} className="text-slate-500 group-hover:text-amber-500 opacity-60 group-hover:opacity-100 transition-all" />
                )}
              </button>
            );
          })}
        </nav>



        {/* Rodapé da Sidebar - Dados do Usuário & Logout */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                <User size={14} className="text-slate-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
                <p className="text-[10px] text-slate-500 truncate select-all">
                  {userEmail}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sair do Portal"
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors focus:outline-none shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
