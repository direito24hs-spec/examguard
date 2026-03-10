import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type AccessToken = {
  id: string
  code: string
  exam_id: string
  exam_title?: string
  valid_from: string
  valid_until: string
  active: boolean
  created_at: string
  uses_count?: number
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  code += '-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function AccessTokenManager() {
  const [tokens, setTokens] = useState<AccessToken[]>([])
  const [exams, setExams] = useState<{id: string, title: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    exam_id: '',
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
  })
  const [creating, setCreating] = useState(false)
  const [newCode, setNewCode] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [tokensRes, examsRes] = await Promise.all([
      supabase.from('access_tokens').select('*, exams(title)').order('created_at', { ascending: false }),
      supabase.from('exams').select('id, title').order('title')
    ])
    if (tokensRes.data) {
      const mapped = tokensRes.data.map((t: any) => ({
        ...t,
        exam_title: t.exams?.title || 'Prova removida'
      }))
      setTokens(mapped)
    }
    if (examsRes.data) setExams(examsRes.data)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const code = generateCode()
    const { error } = await supabase.from('access_tokens').insert({
      code,
      exam_id: form.exam_id,
      valid_from: new Date(form.valid_from).toISOString(),
      valid_until: new Date(form.valid_until).toISOString(),
      active: true,
    })
    if (!error) {
      setNewCode(code)
      setShowForm(false)
      fetchData()
    }
    setCreating(false)
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('access_tokens').update({ active: !active }).eq('id', id)
    setTokens(prev => prev.map(t => t.id === id ? { ...t, active: !active } : t))
  }

  async function deleteToken(id: string) {
    if (!confirm('Deseja excluir este codigo de acesso?')) return
    await supabase.from('access_tokens').delete().eq('id', id)
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  const isExpired = (valid_until: string) => new Date(valid_until) < new Date()

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/professor')} className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Codigos de Acesso</h1>
        </div>

        {newCode && (
          <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-emerald-300 font-semibold text-sm mb-1">Codigo criado com sucesso!</p>
              <p className="text-white font-mono text-3xl font-bold tracking-widest">{newCode}</p>
              <p className="text-emerald-400 text-xs mt-1">Informe este codigo ao aluno antes do inicio da prova</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(newCode) }} className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg">Copiar</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 text-sm">{tokens.length} codigo(s) gerado(s)</p>
          <button
            onClick={() => { setShowForm(!showForm); setNewCode('') }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Gerar Novo Codigo
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
            <h2 className="text-white font-semibold mb-4">Novo Codigo de Acesso</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-1.5">Prova vinculada</label>
                <select
                  value={form.exam_id}
                  onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))}
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm"
                >
                  <option value="">Selecione uma prova...</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Valido a partir de</label>
                <input
                  type="datetime-local"
                  value={form.valid_from}
                  onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Valido ate</label>
                <input
                  type="datetime-local"
                  value={form.valid_until}
                  onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
                  {creating ? 'Gerando...' : 'Gerar Codigo'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-sm transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Nenhum codigo gerado ainda. Crie o primeiro acima.</div>
        ) : (
          <div className="space-y-3">
            {tokens.map(token => {
              const expired = isExpired(token.valid_until)
              return (
                <div key={token.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xl font-bold text-white tracking-widest">{token.code}</span>
                      {expired && <span className="text-xs bg-red-900/40 text-red-400 border border-red-700/40 px-2 py-0.5 rounded-full">Expirado</span>}
                      {!expired && token.active && <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded-full">Ativo</span>}
                      {!expired && !token.active && <span className="text-xs bg-slate-600/40 text-slate-400 border border-slate-600/40 px-2 py-0.5 rounded-full">Desativado</span>}
                    </div>
                    <p className="text-slate-400 text-sm">{token.exam_title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      De {new Date(token.valid_from).toLocaleString('pt-BR')} ate {new Date(token.valid_until).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(token.code)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition"
                    >
                      Copiar
                    </button>
                    <button
                      onClick={() => toggleActive(token.id, token.active)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${token.active ? 'bg-yellow-700/40 hover:bg-yellow-700/60 text-yellow-300' : 'bg-emerald-700/40 hover:bg-emerald-700/60 text-emerald-300'}`}
                    >
                      {token.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => deleteToken(token.id)}
                      className="text-xs bg-red-900/30 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg transition"
                    >
                      Excluir
                    </button>
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
