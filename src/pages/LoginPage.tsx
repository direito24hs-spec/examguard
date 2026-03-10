import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [role, setRole] = useState<'professor' | 'student'>('professor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isRegister) {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('exam_profiles').insert({
          user_id: data.user.id,
          full_name: name,
          email,
          role
        })
        setSuccess('Cadastro realizado! Verifique seu email para confirmar.')
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError('Email ou senha incorretos.'); setLoading(false); return }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">&#128737;</div>
          <h1 className="text-3xl font-bold text-white">ExamGuard</h1>
          <p className="text-slate-400 mt-1">Sistema de Avaliação Segura</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegister ? 'Criar conta' : 'Entrar'}
          </h2>

          {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">{error}</div>}
          {success && <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="label">Nome completo</label>
                  <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Seu nome" />
                </div>
                <div>
                  <label className="label">Perfil</label>
                  <select className="input" value={role} onChange={e => setRole(e.target.value as 'professor' | 'student')}>
                    <option value="professor">Professor</option>
                    <option value="student">Aluno</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Sua senha" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-4 text-sm">
            {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-blue-400 hover:underline">
              {isRegister ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
