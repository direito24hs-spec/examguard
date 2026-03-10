import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import ProfessorDashboard from './pages/professor/Dashboard'
import ExamForm from './pages/professor/ExamForm'
import QuestionManager from './pages/professor/QuestionManager'
import ExamResults from './pages/professor/ExamResults'
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
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/exam/:examId/identify" element={<StudentIdentify />} />
        <Route path="/exam/:examId/instructions" element={<ExamInstructions />} />
        <Route path="/exam/:examId/session" element={<ExamSession />} />
        <Route path="/exam/:examId/confirm" element={<ExamConfirm />} />
        <Route path="/exam/:examId/result" element={<ExamResult />} />
        {/* Rotas do professor */}
        <Route
          path="/"
          element={
            !session
              ? <Navigate to="/login" replace />
              : userRole === 'professor'
              ? <ProfessorDashboard />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/exam/new"
          element={!session ? <Navigate to="/login" replace /> : <ExamForm />}
        />
        <Route
          path="/exam/:id/edit"
          element={!session ? <Navigate to="/login" replace /> : <ExamForm />}
        />
        <Route
          path="/exam/:examId/questions"
          element={!session ? <Navigate to="/login" replace /> : <QuestionManager />}
        />
        <Route
          path="/exam/:examId/results"
          element={!session ? <Navigate to="/login" replace /> : <ExamResults />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
