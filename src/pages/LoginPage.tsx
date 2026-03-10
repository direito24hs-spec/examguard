import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="h-screen overflow-hidden bg-white flex items-center justify-center font-sans">
      <div className="w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Lado Esquerdo - Formulario */}
        <div className="w-full md:w-[480px] flex flex-col">
          <div className="mb-12">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-2">
              PAINEL COMPLETO PARA GESTORES.<br />
              CONTROLE E INSIGHTS EM TEMPO REAL
            </h2>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-950 mb-2">Acesso do Gestor</h1>
            <p className="text-lg text-slate-600">Entre com suas credenciais institucionais</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="w-20 text-xl font-bold text-slate-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="professor@instituicao.com"
                  className="flex-1 bg-slate-100 border-none text-slate-900 placeholder-slate-400 rounded-lg px-4 py-4 text-lg focus:ring-2 focus:ring-slate-400 transition shadow-inner"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-20 text-xl font-bold text-slate-900">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                  className="flex-1 bg-slate-100 border-none text-slate-900 placeholder-slate-400 rounded-lg px-4 py-4 text-lg focus:ring-2 focus:ring-slate-400 transition shadow-inner"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#526D82] hover:bg-[#27374D] disabled:bg-slate-400 text-white font-bold py-5 rounded-xl text-xl transition-all shadow-md active:scale-[0.98]"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>

              <div className="pt-8 flex flex-col items-start gap-6">
                <button
                  onClick={() => navigate('/aluno')}
                  className="px-8 py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold rounded-lg text-lg transition-all shadow-sm active:scale-[0.98]"
                >
                  Acessar como Aluno
                </button>
                
                <button
                  type="button"
                  onClick={() => { setMode('recover'); setError(''); setSuccess('') }}
                  className="text-slate-500 hover:text-slate-900 text-sm font-medium underline underline-offset-4 transition"
                >
                  Esqueceu a senha? Clique aqui para recuperar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
               <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-950 text-sm font-bold mb-4 transition"
              >
                ← VOLTAR AO LOGIN
              </button>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Recuperar Senha</h2>
                <p className="text-slate-600 mt-1">Enviaremos um link de redefinicao para o seu email</p>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium">
                  {success}
                </div>
              )}

              <form onSubmit={handleRecover} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-900 uppercase">Email cadastrado</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="professor@instituicao.com"
                    className="w-full bg-slate-100 border-none text-slate-900 placeholder-slate-400 rounded-lg px-4 py-4 text-lg focus:ring-2 focus:ring-slate-400 transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#526D82] hover:bg-[#27374D] text-white font-bold py-4 rounded-xl text-lg transition"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Lado Direito - Monitor Limpo conforme modelo */}
        <div className="hidden md:flex flex-1 items-center justify-end">
          <div className="relative w-full max-w-[750px]">
             {/* Vetor de monitor isométrico limpo para manter a identidade visual do modelo */}
             <div className="relative z-10 transform scale-110">
                <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
                  {/* Base do monitor */}
                  <path d="M400 520 L480 500 L560 520 L480 540 Z" fill="#E2E8F0"/>
                  <path d="M470 480 L490 480 L490 510 L470 510 Z" fill="#CBD5E0"/>
                  
                  {/* Corpo do monitor */}
                  <path d="M200 150 L650 100 L700 380 L250 430 Z" fill="#2D3748" stroke="#1A202C" strokeWidth="4"/>
                  <path d="M220 170 L630 125 L675 365 L265 410 Z" fill="#F8FAFC"/>
                  
                  {/* Conteúdo do dashboard (simulado) */}
                  <rect x="240" y="190" width="100" height="80" rx="4" fill="#E2E8F0" transform="rotate(-5, 240, 190)"/>
                  <rect x="360" y="180" width="240" height="150" rx="4" fill="#EDF2F7" transform="rotate(-5, 360, 180)"/>
                  <rect x="250" y="290" width="90" height="100" rx="4" fill="#E2E8F0" transform="rotate(-5, 250, 290)"/>
                  
                  {/* Linhas de dados simuladas */}
                  <rect x="380" y="200" width="180" height="8" rx="2" fill="#CBD5E0" transform="rotate(-5, 380, 200)"/>
                  <rect x="380" y="220" width="140" height="8" rx="2" fill="#CBD5E0" transform="rotate(-5, 380, 220)"/>
                  <rect x="380" y="240" width="200" height="40" rx="4" fill="#526D82" opacity="0.1" transform="rotate(-5, 380, 240)"/>
                  
                  {/* Avatares simulados na tela */}
                  <circle cx="270" cy="215" r="12" fill="#A0AEC0"/>
                  <circle cx="300" cy="212" r="12" fill="#A0AEC0"/>
                  <circle cx="330" cy="210" r="12" fill="#A0AEC0"/>

                  {/* Icones externos flutuantes (limpos) */}
                  <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                    <path d="M680 180 L730 160 L730 200 L680 220 Z" fill="#EDF2F7" stroke="#CBD5E0" strokeWidth="2"/>
                    <path d="M700 185 L715 178 L715 195 L700 202 Z" fill="#526D82"/>
                  </g>
                  
                  <g className="animate-pulse">
                    <path d="M150 350 L220 330 L220 400 L150 420 Z" fill="#EDF2F7" stroke="#CBD5E0" strokeWidth="2"/>
                    <circle cx="185" cy="375" r="15" fill="#526D82" opacity="0.2"/>
                  </g>
                </svg>
             </div>

             {/* Background soft glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-50 rounded-full -z-0 opacity-40 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
