import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  DollarSign
} from 'lucide-react';

export default function Dashboard({ clientData, activeTab }) {
  if (!clientData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

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

  // Cálculos de progresso
  const totalSteps = clientData.passos?.length || 0;
  const completedSteps = clientData.passos?.filter(p => p.status === 'Concluido').length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 105) : 0;
  // Capped at 100 for safety, but using 100 max:
  const actualPercent = Math.min(progressPercent, 100);

  // Agrupar passos do board por macro categorias para a visualização agrupada
  const stepsByMacro = clientData.passos?.reduce((acc, step) => {
    if (!acc[step.macro]) {
      acc[step.macro] = [];
    }
    acc[step.macro].push(step);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Seção de Introdução do Cliente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-4">
          {clientData.logoUrl ? (
            <img 
              src={clientData.logoUrl} 
              alt={clientData.nome} 
              className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-md shrink-0" 
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {clientData.nome.charAt(0)}
            </div>
          )}
          <div>
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Bem-vindo ao seu Painel</span>
            <h2 className="text-2xl font-display font-bold text-white mt-0.5">{clientData.nome}</h2>
            <p className="text-sm text-slate-400">Responsável: {clientData.responsavel} • {clientData.email}</p>
          </div>
        </div>

        {/* Card de Progresso Geral */}
        <div className="w-full md:w-80 space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400">Progresso do Setup</span>
            <span className="font-bold text-amber-500 glow-amber text-sm">{actualPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${actualPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right">
            {completedSteps} de {totalSteps} etapas concluídas
          </p>
        </div>
      </div>

      {/* RENDERIZAR ABAS */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-white">Mapa de Bordo</h3>
              <p className="text-sm text-slate-400">Acompanhe as etapas de configuração da sua conta de marketing.</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle2 size={14} /> Concluído
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                <Clock size={14} /> Pendente
              </span>
            </div>
          </div>

          {/* Timeline de Macro Passos */}
          <div className="grid grid-cols-1 gap-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/5">
            {getOrderedMacros(clientData).filter(macro => stepsByMacro[macro] && stepsByMacro[macro].length > 0).map((macro, idx) => {
              const steps = stepsByMacro[macro];
              const isMacroCompleted = steps.every(s => s.status === 'Concluido');
              
              return (
                <div key={macro} className="relative pl-14 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Marcador na Timeline */}
                  <div className={`
                    absolute left-3.5 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300
                    ${isMacroCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-slate-900 border-white/20 text-slate-500'}
                  `}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  {/* Header do Macro Passo */}
                  <div className="mb-4">
                    <h4 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                      {macro}
                      {isMacroCompleted && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          Etapa Concluída
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Lista de Micro Passos (Cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {steps.map((step) => {
                      const isDone = step.status === 'Concluido';
                      return (
                        <div 
                          key={step.id} 
                          className={`
                            p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full
                            ${isDone 
                              ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40' 
                              : 'bg-white/2 border-white/5 hover:border-white/10'}
                          `}
                        >
                          {/* Glow sutil para itens pendentes que requerem ação */}
                          {!isDone && step.linkAcao && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                          )}

                          <div className="space-y-2.5">
                            {/* Badges de Status */}
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                                Passo {step.ordem}
                              </span>
                              <span className={`
                                text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1
                                ${isDone 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-emerald' 
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 glow-amber'}
                              `}>
                                {isDone ? (
                                  <>
                                    <CheckCircle2 size={10} /> Concluído
                                  </>
                                ) : (
                                  <>
                                    <Clock size={10} /> Pendente
                                  </>
                                )}
                              </span>
                            </div>

                            <h5 className="font-semibold text-white leading-snug">{step.titulo}</h5>
                            <p className="text-xs text-slate-400 leading-relaxed">{step.descricao}</p>
                          </div>

                          {/* Botão de Ação para Pendentes */}
                          {!isDone && step.linkAcao && (
                            <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                              {step.linkAcao.includes('drive.google.com') ? (
                                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-500/15 space-y-2 text-left">
                                  <div className="flex items-center gap-2">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                                      <path d="M9.01 19.02l3-5.2H20l-3 5.2H9.01z" fill="#0066da"/>
                                      <path d="M2.01 13.82l3-5.2h15.98l-3 5.2H2.01z" fill="#00a85d"/>
                                      <path d="M12.51 3.42l3 5.2H6.53l-3-5.2h8.98z" fill="#ffcc00"/>
                                    </svg>
                                    <span className="text-[11px] font-bold text-slate-300">Pasta Compartilhada no Google Drive</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Sua agência preparou uma pasta exclusiva no Google Drive para receber seus arquivos em alta definição.
                                  </p>
                                  <div className="space-y-1">
                                    <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Arquivos sugeridos:</span>
                                    <ul className="text-[9px] text-slate-400 space-y-1 pl-3.5 list-disc leading-normal">
                                      <li>Logotipo vetorizado principal (.SVG, .AI ou .PDF)</li>
                                      <li>Logotipo em imagem com fundo transparente (.PNG)</li>
                                      <li>Fotos em alta definição de pratos, produtos ou do local</li>
                                      <li>Referências visuais ou manual de marca</li>
                                    </ul>
                                  </div>
                                  <a
                                    href={step.linkAcao}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/10 cursor-pointer"
                                  >
                                    {step.textoBotao || "Enviar Arquivos no Drive"}
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={step.linkAcao}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 active:scale-95 transition-all duration-200 shadow-md shadow-amber-500/15"
                                >
                                  {step.textoBotao || "Ir para Tarefa"}
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white">Painel Financeiro</h3>
            <p className="text-sm text-slate-400 font-medium">Consulte e gerencie mensalidades e faturas do seu plano de assessoria.</p>
          </div>

          {clientData.linkFinanceiro ? (
            <div className="p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-tr from-slate-950/80 to-slate-900/60 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up shadow-xl shadow-amber-500/5">
              <div className="space-y-2">
                <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                  <DollarSign className="text-amber-500 glow-amber" size={22} />
                  Faturamento e Cobranças
                </h4>
                <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                  Para visualizar faturas pendentes, gerenciar seus meios de pagamento, consultar histórico ou realizar pagamentos via PIX/Cartão, acesse nossa central de faturamento dedicada no botão ao lado.
                </p>
              </div>
              <a
                href={clientData.linkFinanceiro}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 active:scale-95 transition-all duration-200 shadow-lg shadow-amber-500/20 w-full md:w-auto text-center shrink-0 cursor-pointer animate-pulse"
              >
                Acessar Portal Financeiro
                <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-white/5 bg-slate-950/20 text-center text-slate-500 space-y-2">
              <p className="text-sm">Nenhum portal financeiro externo configurado para sua conta.</p>
              <p className="text-xs text-slate-600">Por favor, entre em contato com o suporte da agência para obter seu link de faturamento.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white">Relatórios Mensais</h3>
            <p className="text-sm text-slate-400">Consulte os resultados estratégicos e de tráfego pago gerados para o seu restaurante.</p>
          </div>

          {clientData.relatorios && clientData.relatorios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clientData.relatorios.map((rel) => (
                <div 
                  key={rel.id} 
                  className="p-6 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-base leading-snug">{rel.titulo}</h4>
                      <p className="text-xs text-slate-400">Mês de Referência: <span className="font-medium text-slate-200">{rel.mesRef}</span></p>
                      <p className="text-[10px] text-slate-500">
                        Enviado em: {new Date(rel.dataUpload).toLocaleDateString('pt-BR')} às {new Date(rel.dataUpload).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <a
                      href={rel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors"
                    >
                      <Download size={14} /> Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl border border-white/5 bg-slate-950/20 text-slate-500">
              Nenhum relatório mensal enviado até o momento.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
