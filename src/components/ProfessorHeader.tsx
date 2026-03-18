import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function ProfessorHeader() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '')
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 flex flex-col p-6 gap-6 flex-shrink-0">
      <div className="mb-2">
        <h1 className="text-white font-black text-lg tracking-tight">Prova Segura</h1>
        <p className="text-slate-400 text-xs font-medium">Brito Advogados</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <button
          onClick={() => navigate('/professor')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-black text-sm"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/professor/codigos')}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-colors"
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
  )
}
