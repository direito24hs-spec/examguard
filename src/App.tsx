import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import ProfessorDashboard from './pages/professor/Dashboard'
import ExamForm from './pages/professor/ExamForm'
import QuestionManager from './pages/professor/QuestionManager'
import ExamResults from './pages/professor/ExamResults'
import AccessTokenManager from './pages/professor/AccessTokenManager'
import AlunoAccess from './pages/student/AlunoAccess'
import StudentIdentify from './pages/student/StudentIdentify'
import ExamInstructions from './pages/student/ExamInstructions'
import ExamSession from './pages/student/ExamSession'
import ExamResult from './pages/student/ExamResult'
import ExamConfirm from './pages/student/ExamConfirm'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else { setUserRole(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from('exam_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()
    setUserRole(data?.role ?? null)
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas publicas */}
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/professor" replace />} />
        <Route path="/aluno" element={<AlunoAccess />} />

        {/* Rotas do aluno pela prova */}
        <Route path="/exam/:examId/identify" element={<StudentIdentify />} />
        <Route path="/exam/:examId/instructions" element={<ExamInstructions />} />
        <Route path="/exam/:examId/session" element={<ExamSession />} />
        <Route path="/exam/:examId/confirm" element={<ExamConfirm />} />
        <Route path="/exam/:examId/result" element={<ExamResult />} />

        {/* Rotas do professor (requerem autenticacao) */}
        <Route path="/professor" element={session ? <ProfessorDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/professor/exam/new" element={session ? <ExamForm /> : <Navigate to="/login" replace />} />
        <Route path="/professor/exam/:id" element={session ? <ExamForm /> : <Navigate to="/login" replace />} />
        <Route path="/professor/exam/:id/questions" element={session ? <QuestionManager /> : <Navigate to="/login" replace />} />
        <Route path="/professor/exam/:id/results" element={session ? <ExamResults /> : <Navigate to="/login" replace />} />
        <Route path="/professor/codigos" element={session ? <AccessTokenManager /> : <Navigate to="/login" replace />} />

        {/* Redirect default */}
        <Route path="/" element={<Navigate to={session ? '/professor' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={session ? '/professor' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
