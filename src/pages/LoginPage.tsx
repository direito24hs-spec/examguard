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
      setError('Nao foi possivel enviar o email. Tente novamente.')
    } else {
      setSuccess('Email de recuperacao enviado para ' + email + '. Verifique sua caixa de entrada.')
    }
    setLoading(false)
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex items-center justify-center font-sans relative">
      {/* Background shapes for a modern feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-60"></div>

      <div className="w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Lado Esquerdo - Marca e Texto */}
        <div className="w-full md:w-[500px] flex flex-col">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Plataforma Premium
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-[1.1] mb-3">
              PAINEL COMPLETO PARA GESTORES.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                CONTROLE E INSIGHTS EM TEMPO REAL
              </span>
            </h2>
            <p className="text-slate-500 text-base max-w-md">
              Acompanhe o desempenho de suas turmas e gerencie avaliacoes com seguranca juridica.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
            {error && (
              <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold flex items-center gap-3">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}
            
            {success && (
              <div className="mb-5 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-semibold flex items-center gap-3">
                <span className="text-lg">✅</span> {success}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 ml-1 text-sm">Email Corporativo</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu.nome@instituicao.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-3.5 text-base focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 ml-1 text-sm">Chave de Acesso</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-3.5 text-base focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition"
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
                    className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-slate-200 hover:shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                  >
                    {loading ? 'Validando...' : 'Acessar Painel'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/aluno')}
                      className="flex-1 px-4 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-xl text-xs transition-all text-center border border-blue-100"
                    >
                      Portal do Aluno
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('recover'); setError(''); setSuccess('') }}
                      className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 font-bold rounded-xl text-xs transition-all text-center border border-slate-200"
                    >
                      Esqueci Senha
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                 <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition group text-sm"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> VOLTAR AO LOGIN
                </button>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">Recuperar Acesso</h2>
                  <p className="text-slate-500 mt-1 font-medium text-sm">Enviaremos instrucoes para o seu e-mail institucional.</p>
                </div>

                <form onSubmit={handleRecover} className="space-y-5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-2 ml-1 text-xs uppercase">E-mail Cadastrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-5 py-4 text-base focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg transition shadow-lg"
                  >
                    {loading ? 'Processando...' : 'Enviar Link de Recuperacao'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito - Ilustracao Estilizada */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          <div className="relative w-full aspect-square max-w-[650px]">
             {/* Decorative element */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
             
             <div className="relative z-10 transition-transform duration-1000 transform hover:scale-[1.02]">
                {/* SVG Isometrico Moderno */}
                <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_50px_50px_rgba(0,0,0,0.08)]">
                  {/* Base / Podium */}
                  <path d="M100 450 L400 350 L700 450 L400 550 Z" fill="#F1F5F9"/>
                  
                  {/* Monitor Body */}
                  <path d="M150 180 L600 120 L650 420 L200 480 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="8"/>
                  <path d="M170 200 L580 145 L625 405 L215 460 Z" fill="#FFFFFF"/>
                  
                  {/* Dashboard UI Blocks */}
                  <rect x="230" y="220" width="120" height="100" rx="12" fill="#F8FAFC" transform="rotate(-6, 230, 220)"/>
                  <rect x="370" y="200" width="230" height="220" rx="12" fill="#F1F5F9" transform="rotate(-6, 370, 200)"/>
                  
                  {/* Stats bars */}
                  <rect x="390" y="230" width="190" height="12" rx="6" fill="#E2E8F0" transform="rotate(-6, 390, 230)"/>
                  <rect x="390" y="260" width="140" height="12" rx="6" fill="#E2E8F0" transform="rotate(-6, 390, 260)"/>
                  
                  {/* Highlight bar */}
                  <rect x="390" y="300" width="200" height="60" rx="12" fill="#3B82F6" opacity="0.1" transform="rotate(-6, 390, 300)"/>
                  <rect x="410" y="325" width="100" height="10" rx="5" fill="#3B82F6" transform="rotate(-6, 410, 325)"/>

                  {/* Floating elements */}
                  <g className="animate-bounce" style={{ animationDuration: '4s' }}>
                    <path d="M680 200 L740 180 L740 240 L680 260 Z" fill="white" stroke="#E2E8F0" strokeWidth="2" className="drop-shadow-lg"/>
                    <rect x="695" y="210" width="25" height="4" rx="2" fill="#3B82F6" transform="rotate(-15, 695, 210)"/>
                  </g>

                  <g className="animate-pulse">
                    <path d="M80 380 L160 360 L160 440 L80 460 Z" fill="white" stroke="#E2E8F0" strokeWidth="2" className="drop-shadow-lg"/>
                    <circle cx="120" cy="410" r="15" fill="#6366F1" opacity="0.2"/>
                  </g>
                </svg>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
