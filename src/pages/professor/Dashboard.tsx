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
    if (s === 'draft') return { text: 'Rascunho', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
    if (s === 'open') return { text: 'Ativa', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
    return { text: 'Encerrada', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 flex flex-col border-r border-slate-800 shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-base tracking-tight leading-none">Prova Segura</h1>
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1 block">Brito Advogados</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/professor/codigos')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
              Acessos
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Conta Ativa</p>
            <p className="text-white text-xs font-bold truncate mb-3">{userEmail}</p>
            <button onClick={handleSignOut} className="w-full py-2 bg-slate-700 hover:bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors">Sair da Sessão</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-slate-900 font-black text-xl leading-none">Visão Geral</h2>
            <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">Painel de Controle Jurídico</p>
          </div>
          <button 
            onClick={() => navigate('/professor/exam/new')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            CRIAR NOVA PROVA
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Total de Provas</p>
                  <p className="text-slate-900 text-3xl font-black">{exams.length}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Abertas Agora</p>
                  <p className="text-emerald-600 text-3xl font-black">{exams.filter(e => e.status === 'open').length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Ações Pendentes</p>
                  <p className="text-amber-600 text-3xl font-black">{exams.filter(e => e.status === 'draft').length}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-900 font-black text-lg">Suas Avaliações Recentes</h3>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white rounded-[2rem] border border-slate-100 shadow-sm"></div>)}
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
                <h4 className="text-slate-900 font-black text-xl mb-2">Editor Vazio</h4>
                <p className="text-slate-400 max-w-xs mx-auto mb-8 font-medium">Você ainda não criou nenhuma prova. Comece agora para gerenciar seus alunos.</p>
                <button 
                  onClick={() => navigate('/professor/exam/new')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm transition-all"
                >
                  CRIAR PRIMEIRA PROVA
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {exams.map(exam => {
                  const info = statusInfo(exam.status)
                  return (
                    <div key={exam.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all p-8 flex flex-col relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12 transition-colors ${exam.status === 'open' ? 'bg-emerald-500' : exam.status === 'draft' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                      
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${info.color}`}>
                          {info.text}
                        </span>
                        <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">
                          {new Date(exam.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <h4 className="text-slate-900 font-black text-xl mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {exam.title}
                      </h4>
                      
                      <p className="text-slate-400 text-sm line-clamp-2 mb-8 font-medium">
                        {exam.description || 'Sem descrição adicional.'}
                      </p>

                      <div className="mt-auto pt-6 border-t border-slate-50 flex gap-2 relative z-10">
                        <button 
                          onClick={() => navigate(`/professor/exam/${exam.id}`)}
                          className="flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
                        >
                          Config
                        </button>
                        <button 
                          onClick={() => navigate(`/professor/exam/${exam.id}/questions`)}
                          className="flex-1 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
                        >
                          Questoes
                        </button>
                        <button 
                          onClick={() => navigate(`/professor/exam/${exam.id}/results`)}
                          className="flex-1 px-3 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
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
        </div>
      </main>
    </div>
  )
}
