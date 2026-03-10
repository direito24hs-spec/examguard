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
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
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
    if (s === 'draft') return { text: 'Rascunho', color: 'bg-yellow-600' }
    if (s === 'open') return { text: 'Aberta', color: 'bg-green-600' }
    return { text: 'Encerrada', color: 'bg-red-700' }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">ExamGuard — Painel do Professor</h1>
          <button onClick={handleSignOut} className="text-sm text-slate-400 hover:text-white">Sair</button>
        </div>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate('/professor/exam/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded"
          >
            + Nova Prova
          </button>
        </div>
        {loading ? (
          <p className="text-slate-400">Carregando...</p>
        ) : exams.length === 0 ? (
          <p className="text-slate-400">Nenhuma prova criada ainda.</p>
        ) : (
          <div className="space-y-4">
            {exams.map(exam => {
              const st = statusLabel(exam.status)
              return (
                <div key={exam.id} className="bg-slate-800 rounded-lg p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl text-white font-semibold">{exam.title}</h2>
                      {exam.description && <p className="text-slate-400 text-sm mt-1">{exam.description}</p>}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${st.color}`}>{st.text}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => navigate(`/professor/exam/${exam.id}`)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded">Editar</button>
                    <button onClick={() => navigate(`/professor/exam/${exam.id}/questions`)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded">Questoes</button>
                    <button onClick={() => navigate(`/professor/exam/${exam.id}/results`)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded">Resultados</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
