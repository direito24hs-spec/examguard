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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-8">

        {/* Lado esquerdo - marca */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="mb-4">
            <svg width="72" height="72" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h1 className="text-3xl font-bold text-white mb-1">Prova Segura</h1>
          <p className="text-blue-300 font-medium text-base mb-4">Brito Advogados</p>
          <p className="text-slate-400 text-sm mb-3">Sistema de Avaliacao Inteligente</p>
          <ul className="space-y-1.5 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Correcao automatica com feedback
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Monitoramento anti-cola em tempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Codigos de acesso por turma
            </li>
          </ul>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-96 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
          {mode === 'login' ? (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">Acesso do Gestor</h2>
                <p className="text-slate-400 text-sm mt-1">Entre com suas credenciais institucionais</p>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="professor@instituicao.com"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Sua senha"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => { setMode('recover'); setError(''); setSuccess('') }}
                  className="w-full text-blue-400 hover:text-blue-300 text-xs transition text-center"
                >
                  Esqueceu a senha? Clique aqui para recuperar
                </button>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-xs text-center mb-2">Voce e aluno?</p>
                  <button
                    onClick={() => navigate('/aluno')}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 rounded-lg transition text-sm"
                  >
                    Acessar como Aluno
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition"
              >
                ← Voltar ao login
              </button>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">Recuperar Senha</h2>
                <p className="text-slate-400 text-sm mt-1">Enviaremos um link de redefinicao para o seu email</p>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs">
                  {success}
                </div>
              )}

              <form onSubmit={handleRecover} className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Email cadastrado</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="professor@instituicao.com"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
  )
}
