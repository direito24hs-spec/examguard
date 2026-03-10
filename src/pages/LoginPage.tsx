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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12">

        {/* Lado esquerdo - marca */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="mb-6">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="45" r="45" fill="url(#grad1)" />
              <path d="M45 20 L62 30 L62 50 C62 62 45 72 45 72 C45 72 28 62 28 50 L28 30 Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2"/>
              <path d="M36 45 L42 51 L55 38" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="100%" stopColor="#1D4ED8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1 leading-tight">
            Prova Segura
          </h1>
          <p className="text-blue-300 text-base font-semibold mb-1">Brito Advogados</p>
          <p className="text-slate-400 text-sm mb-5">Sistema de Avaliacao Inteligente</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-slate-300 text-sm">Correccao automatica com feedback</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <span className="text-slate-300 text-sm">Monitoramento anti-cola em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <span className="text-slate-300 text-sm">Codigos de acesso por turma</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-96">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">

            {mode === 'login' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Acesso do Gestor</h2>
                <p className="text-slate-400 text-sm mb-6">Entre com suas credenciais</p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Sua senha"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition text-sm mt-2"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => { setMode('recover'); setError(''); setSuccess('') }}
                    className="text-blue-400 hover:text-blue-300 text-sm transition"
                  >
                    Esqueceu a senha? Clique aqui para recuperar
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-700">
                  <p className="text-slate-500 text-xs text-center mb-3">Voce e aluno?</p>
                  <button
                    onClick={() => navigate('/aluno')}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 rounded-lg transition text-sm"
                  >
                    Acessar como Aluno
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Voltar ao login
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">Recuperar Senha</h2>
                <p className="text-slate-400 text-sm mb-6">Enviaremos um link de redefinicao para o seu email</p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm px-4 py-3 rounded-lg mb-4">
                    {success}
                  </div>
                )}

                <form onSubmit={handleRecover} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email cadastrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                  >
                    {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
