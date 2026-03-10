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
                  className="flex-1 bg-slate-100 border-none text-slate-900 placeholder-slate-400 rounded-lg px-4 py-4 text-lg focus:ring-2 focus:ring-slate-400 transition"
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
                  className="flex-1 bg-slate-100 border-none text-slate-900 placeholder-slate-400 rounded-lg px-4 py-4 text-lg focus:ring-2 focus:ring-slate-400 transition"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#526D82] hover:bg-[#27374D] disabled:bg-slate-400 text-white font-bold py-5 rounded-xl text-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>

              <div className="pt-8 flex flex-col items-start gap-6">
                <button
                  onClick={() => navigate('/aluno')}
                  className="px-8 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-medium rounded-lg text-lg transition-all"
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
                    className="w-full bg-slate-100 border-none text-slate-900 placeholder-slate-400 rounded-lg px-4 py-4 text-lg focus:ring-2 focus:ring-slate-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-800 hover:bg-black text-white font-bold py-4 rounded-xl text-lg transition"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Lado Direito - Ilustracao */}
        <div className="hidden md:flex flex-1 items-center justify-end relative">
          <div className="relative w-full max-w-[700px]">
            {/* Simulacao da ilustracao isométrica do monitor com dashboards */}
            <div className="relative z-10 animate-fade-in transition-all duration-1000 transform hover:scale-105">
              <img 
                src="https://img.freepik.com/free-vector/modern-monitor-with-data-chart-dashboard-concept_1017-31628.jpg" 
                alt="Dashboard Analytics" 
                className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] rounded-2xl"
              />
              
              {/* Elementos flutuantes simulando o estilo da imagem do usuario */}
              <div className="absolute -top-10 -right-10 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce transition-all duration-1000 delay-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white">🔑</div>
                  <div>
                    <div className="w-16 h-2 bg-slate-200 rounded mb-1"></div>
                    <div className="w-10 h-2 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/4 -left-12 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 animate-pulse">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Taxa de Cola</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <div className="text-2xl font-black text-slate-900">75%</div>
                </div>
              </div>

              <div className="absolute bottom-10 -right-8 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Desempenho da Turma</div>
                <div className="flex items-end gap-1 h-12">
                  <div className="w-3 bg-blue-100 h-1/2 rounded-t-sm"></div>
                  <div className="w-3 bg-blue-200 h-3/4 rounded-t-sm"></div>
                  <div className="w-3 bg-blue-400 h-full rounded-t-sm"></div>
                  <div className="w-3 bg-blue-600 h-2/3 rounded-t-sm"></div>
                </div>
              </div>

              <div className="absolute -bottom-6 left-1/4 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Monitoramento em Tempo Real</span>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-slate-50 rounded-full -z-0 opacity-50 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
