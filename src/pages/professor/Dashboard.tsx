import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type Exam = {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'open' | 'closed'
  created_at: string
  results_released: boolean
}

export default function ProfessorDashboard() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '')
    })
  }, [])

  async function fetchExams() {
    const { data } = await supabase
      .from('exams')
      .select('id, title, description, status, created_at, results_released')
      .order('created_at', { ascending: false })
    setExams((data as Exam[]) || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const statusLabel = (s: string) => {
    if (s === 'draft') return { text: 'Rascunho', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' }
    if (s === 'open') return { text: 'Aberta', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' }
    return { text: 'Encerrada', color: 'bg-red-700/20 text-red-400 border-red-700/30' }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="text-white font-bold text-lg">ProvaSegura</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden md:block">{userEmail}</span>
            <button onClick={handleSignOut} className="text-sm text-slate-400 hover:text-white transition">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Acoes rapidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/professor/exam/new')}
            className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-xl p-5 text-left transition group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <p className="text-white font-semibold">Nova Prova</p>
            <p className="text-slate-400 text-sm mt-0.5">Criar uma nova avaliacao</p>
          </button>
          <button
            onClick={() => navigate('/professor/codigos')}
            className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 rounded-xl p-5 text-left transition group"
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <p className="text-white font-semibold">Codigos de Acesso</p>
            <p className="text-slate-400 text-sm mt-0.5">Gerar codigos para alunos</p>
          </button>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <p className="text-white font-semibold">{exams.length} Prova(s)</p>
            <p className="text-slate-400 text-sm mt-0.5">{exams.filter(e => e.status === 'open').length} abertas agora</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">Minhas Provas</h2>

        {loading ? (
          <p className="text-slate-400">Carregando...</p>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 mb-3">Nenhuma prova criada ainda.</p>
            <button onClick={() => navigate('/professor/exam/new')} className="text-blue-400 hover:text-blue-300 text-sm">Criar primeira prova &rarr;</button>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map(exam => {
              const st = statusLabel(exam.status)
              return (
                <div key={exam.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{exam.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.text}</span>
                    </div>
                    {exam.description && <p className="text-slate-400 text-sm">{exam.description}</p>}
                    <p className="text-slate-500 text-xs mt-1">{new Date(exam.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => navigate(`/professor/exam/${exam.id}`)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition">Editar</button>
                    <button onClick={() => navigate(`/professor/exam/${exam.id}/questions`)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition">Questoes</button>
                    <button onClick={() => navigate(`/professor/exam/${exam.id}/results`)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition">Resultados</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
