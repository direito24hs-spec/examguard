import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AlunoAccess() {
  const [nome, setNome] = useState('')
  const [turma, setTurma] = useState('')
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Buscar codigo de acesso valido
    const now = new Date().toISOString()
    const { data: token, error: tokenError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('code', codigo.toUpperCase().trim())
      .eq('active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .single()

    if (tokenError || !token) {
      setError('Codigo de acesso invalido, expirado ou nao encontrado. Verifique com seu professor.')
      setLoading(false)
      return
    }

    // Registrar acesso do aluno
    const { error: insertError } = await supabase
      .from('student_sessions')
      .insert({
        access_token_id: token.id,
        exam_id: token.exam_id,
        student_name: nome.trim(),
        student_class: turma.trim(),
        started_at: new Date().toISOString(),
      })

    if (insertError) {
      setError('Erro ao registrar acesso. Tente novamente.')
      setLoading(false)
      return
    }

    setLoading(false)
    // Guardar dados do aluno em sessionStorage para uso durante a prova
    sessionStorage.setItem('aluno_nome', nome.trim())
    sessionStorage.setItem('aluno_turma', turma.trim())
    sessionStorage.setItem('aluno_exam_id', token.exam_id)
    navigate(`/exam/${token.exam_id}/instructions`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12">

        {/* Lado esquerdo */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="mb-6">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="45" r="45" fill="url(#grad2)" />
              <path d="M25 35 L45 25 L65 35 L65 55 C65 65 45 75 45 75 C45 75 25 65 25 55 Z" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="2"/>
              <circle cx="45" cy="44" r="8" fill="none" stroke="white" strokeWidth="2.5"/>
              <path d="M45 52 L45 62" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#047857"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">ProvaSegura</h1>
          <p className="text-emerald-300 text-lg font-medium mb-2">Acesso do Aluno</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Insira seus dados e o codigo de acesso fornecido pelo professor para iniciar sua avaliacao.
          </p>
          <div className="mt-6 bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 max-w-xs">
            <p className="text-emerald-300 text-xs font-semibold mb-2">Como funciona?</p>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>1. Preencha seu nome completo</li>
              <li>2. Informe sua turma</li>
              <li>3. Digite o codigo de acesso</li>
              <li>4. Inicie a avaliacao</li>
            </ul>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-96">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Identificacao</h2>
            <p className="text-slate-400 text-sm mb-6">Preencha seus dados para iniciar</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Turma</label>
                <input
                  type="text"
                  value={turma}
                  onChange={e => setTurma(e.target.value)}
                  required
                  placeholder="Ex: 3A, Turma B, 2025-1"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Codigo de acesso</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex: ABCD-1234"
                  maxLength={12}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition uppercase"
                />
                <p className="text-slate-500 text-xs mt-1">Fornecido pelo professor antes da prova</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-semibold py-2.5 rounded-lg transition text-sm mt-2"
              >
                {loading ? 'Verificando...' : 'Acessar Avaliacao'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-700 text-center">
              <a href="/login" className="text-slate-500 hover:text-slate-300 text-xs transition">
                Sou professor &rarr; Acessar painel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
