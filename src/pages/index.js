import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { dbService } from '@/lib/firebase';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  User, 
  UtensilsCrossed,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const router = useRouter();
  
  // Estados de autenticação e formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Controle de etapas do login:
  // 1 = Digitar E-mail
  // 2 = Digitar Senha Existente (Acesso Frequente)
  // 3 = Definir Nova Senha (Primeiro Acesso)
  const [loginStep, setLoginStep] = useState(1);

  // Verificar se o usuário já está logado
  useEffect(() => {
    dbService.getCurrentUser((user) => {
      if (user) {
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    });
  }, [router]);

  // Executa o primeiro passo: verifica o e-mail
  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');

    try {
      const status = await dbService.checkEmailStatus(email.trim().toLowerCase());
      
      if (!status.exists) {
        setError('Este e-mail não está cadastrado em nosso portal. Fale com a agência.');
        setLoading(false);
        return;
      }

      if (status.primeiroAcesso) {
        setLoginStep(3); // Direciona para definir senha
      } else {
        setLoginStep(2); // Direciona para digitar a senha existente
      }
    } catch (err) {
      setError('Erro ao verificar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Executa login padrão
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await dbService.login(email.trim().toLowerCase(), password);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Senha incorreta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Executa o primeiro acesso: registra a senha preferida
  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await dbService.registerFirstAccess(email.trim().toLowerCase(), password);
      // Redireciona dependendo do cadastro
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Erro ao registrar senha de primeiro acesso.');
    } finally {
      setLoading(false);
    }
  };



  const handleBack = () => {
    setLoginStep(1);
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-[#070b13]">
      {/* Elementos visuais de fundo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* Logo / Título */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-xl shadow-amber-500/15 mb-2">
            <UtensilsCrossed className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Portal do Cliente
          </h1>
          <p className="text-slate-400 text-sm">
            Gestão de Marketing para Restaurantes
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl relative">
          
          {/* PASSO 1: INSERIR E-MAIL */}
          {loginStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="text-center pb-2">
                <h2 className="text-base font-bold text-white">Acesse sua Conta</h2>
                <p className="text-xs text-slate-400 mt-1">Insira seu e-mail para verificar o método de login.</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <Info size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  E-mail do Restaurante
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@restaurante.com"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900/80 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-55 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Avançar <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PASSO 2: INSERIR SENHA EXISTENTE */}
          {loginStep === 2 && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-white">Insira sua Senha</h2>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{email}</p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <Info size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900/80 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-55 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Portal <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PASSO 3: CONFIGURAR SENHA DE PRIMEIRO ACESSO */}
          {loginStep === 3 && (
            <form onSubmit={handleSetupPassword} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-amber-500 flex items-center gap-1">
                    <Sparkles size={14} className="animate-pulse" />
                    Crie sua senha
                  </h2>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{email}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-slate-300 text-[11px] leading-relaxed">
                Bem-vindo! Crie uma senha de sua preferência para seus próximos acessos ao portal.
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <Info size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Crie sua Senha (Mín. 6 dígitos)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Sua senha favorita"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900/80 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Confirme sua Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Digite novamente"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900/80 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-55 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Configurar Senha & Entrar <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
