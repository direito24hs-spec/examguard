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

  const statusInfo = (s: string) => {
    if (s === 'draft') return { text: 'Rascunho', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' }
    if (s === 'open') return { text: 'Ativa', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' }
    return { text: 'Encerrada', color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' }
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col p-6 gap-6 flex-shrink-0">
        <div className="mb-2">
          <h1 className="text-white font-black text-lg tracking-tight">Prova Segura</h1>
          <p className="text-slate-400 text-xs font-medium">Brito Advogados</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-black text-sm">
            Dashboard
          </button>
          <button
            onClick={() => navigate('/professor/codigos')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all"
          >
            Acessos
          </button>
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Conta Ativa</p>
          <p className="text-slate-300 text-sm font-medium truncate">{userEmail}</p>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full text-left text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
          >
            Sair da Sessao
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-black mb-1">Visao Geral</p>
              <h2 className="text-3xl font-black text-slate-900">Painel de Controle Juridico</h2>
            </div>
            <button
              onClick={() => navigate('/professor/exam/new')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-slate-200"
            >
              + CRIAR NOVA PROVA
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-black mb-2">Total de Provas</p>
              <p className="text-4xl font-black text-slate-900">{exams.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-black mb-2">Abertas Agora</p>
              <p className="text-4xl font-black text-emerald-500">{exams.filter(e => e.status === 'open').length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-black mb-2">Acoes Pendentes</p>
              <p className="text-4xl font-black text-amber-500">{exams.filter(e => e.status === 'draft').length}</p>
            </div>
          </div>

          {/* Exam List */}
          <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-4">Suas Avaliacoes Recentes</h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
              <h4 className="text-xl font-black text-slate-900 mb-2">Editor Vazio</h4>
              <p className="text-slate-400 text-sm mb-6">Voce ainda nao criou nenhuma prova. Comece agora para gerenciar seus alunos.</p>
              <button
                onClick={() => navigate('/professor/exam/new')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm transition-all"
              >
                CRIAR PRIMEIRA PROVA
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map(exam => {
                const info = statusInfo(exam.status)
                return (
                  <div key={exam.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${info.color}`}>
                          {info.text}
                        </span>
                        <span className="text-slate-400 text-xs">{new Date(exam.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <h4 className="text-slate-900 font-black text-base mb-1">{exam.title}</h4>
                    <p className="text-slate-400 text-sm mb-4">{exam.description || 'Sem descricao adicional.'}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/professor/exam/${exam.id}`)}
                        className="flex-1 px-3 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
                      >
                        Config
                      </button>
                      <button
                        onClick={() => navigate(`/professor/exam/${exam.id}/questions`)}
                        className="flex-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
                      >
                        Questoes
                      </button>
                      <button
                        onClick={() => navigate(`/professor/exam/${exam.id}/results`)}
                        className="flex-1 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
                      >
                        Resultados
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
