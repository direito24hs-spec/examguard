import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState<'login' | 'recover'>('login')
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (signInError) {
      setError('Email ou senha incorretos. Verifique seus dados.')
      setLoading(false)
      return
    }
    
    setLoading(false)
    navigate('/professor')
  }

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    const { error: recoverError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    
    if (recoverError) {
      setError('Não foi possível enviar o e-mail. Tente novamente.')
    } else {
      setSuccess('E-mail de recuperação enviado para ' + email + '. Verifique sua caixa de entrada.')
    }
    setLoading(false)
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-900 flex items-center justify-center font-sans relative">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[140px] opacity-20"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-600 rounded-full blur-[140px] opacity-10"></div>
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[120px] opacity-15"></div>

      <div className="w-full max-w-6xl px-8 flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10">
        
        <div className="hidden lg:flex flex-col w-[450px]">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Sistema de Segurança Brito Advogados
            </div>
            
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Prova Segura<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-400 to-blue-400">
                Gestão Profissional de Exames
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Monitore o progresso acadêmico com precisão jurídica e segurança total de dados.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-500 font-bold mb-1">Feedback</div>
              <div className="text-slate-500 text-xs">Correção automática imediata após envio.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-indigo-400 font-bold mb-1">Segurança</div>
              <div className="text-slate-500 text-xs">Tokens de acesso únicos por aluno.</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-indigo-500 to-blue-500"></div>
            
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-1">Bem-vindo, Gestor</h1>
              <p className="text-slate-500 text-sm font-medium">Insira suas credenciais para acessar o painel.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {success}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest ml-1">E-mail Corporativo</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu.nome@brito.adv.br"
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 rounded-2xl px-6 py-4 text-base focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 rounded-2xl px-6 py-4 text-base focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition"
                      title={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-4.5 rounded-2xl text-lg shadow-xl shadow-slate-200 hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Autenticando...
                      </>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </button>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/aluno')}
                      className="flex-1 px-4 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-black rounded-xl text-xs uppercase tracking-tighter transition-all text-center"
                    >
                      Acesso Aluno
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('recover'); setError(''); setSuccess('') }}
                      className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-xs uppercase tracking-tighter transition-all text-center"
                    >
                      Recuperar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black transition group text-xs uppercase tracking-widest"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar
                </button>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Recuperar</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Enviaremos instruções para seu e-mail.</p>
                </div>
                <form onSubmit={handleRecover} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-black uppercase tracking-widest ml-1">E-mail Cadastrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-6 py-4 text-base focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4.5 rounded-2xl text-lg transition shadow-lg"
                  >
                    {loading ? 'Processando...' : 'Enviar Link'}
                  </button>
                </form>
              </div>
            )}
          </div>
          
          <p className="text-center mt-8 text-slate-500 text-xs font-medium uppercase tracking-[0.2em] opacity-60">
            &copy; 2024 Brito Advogados &bull; Secure Systems
          </p>
        </div>

      </div>
    </div>
  )
}
