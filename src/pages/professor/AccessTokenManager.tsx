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
  const [userEmail, setUserEmail] = useState('')
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
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '')
    })
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
    if (!confirm('Deseja excluir este código de acesso?')) return
    await supabase.from('access_tokens').delete().eq('id', id)
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isExpired = (valid_until: string) => new Date(valid_until) < new Date()

  return (
    <div className=\"flex h-screen bg-slate-50 font-sans overflow-hidden\">
      <aside className=\"w-72 bg-slate-900 flex flex-col border-r border-slate-800 shadow-2xl z-20\">
        <div className=\"p-8\">
          <div className=\"flex items-center gap-3 mb-10\">
            <div className=\"w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20\">
              <svg className=\"w-5 h-5 text-white\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2.5} d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" />
              </svg>
            </div>
            <div>
              <h1 className=\"text-white font-black text-base tracking-tight leading-none\">Prova Segura</h1>
              <span className=\"text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1 block\">Brito Advogados</span>
            </div>
          </div>
          <nav className=\"space-y-1\">
            <button 
              onClick={() => navigate('/professor')}
              className=\"w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all\"
            >
              <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6\"/></svg>
              Dashboard
            </button>
            <button 
              className=\"w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20\"
            >
              <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z\"/></svg>
              Acessos
            </button>
          </nav>
        </div>
        <div className=\"mt-auto p-6\">
          <div className=\"p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50\">
            <p className=\"text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2\">Conta Ativa</p>
            <p className=\"text-white text-xs font-bold truncate mb-3\">{userEmail}</p>
            <button onClick={handleSignOut} className=\"w-full py-2 bg-slate-700 hover:bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors\">Sair da Sessão</button>
          </div>
        </div>
      </aside>

      <main className=\"flex-1 flex flex-col h-full overflow-hidden\">
        <header className=\"h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between flex-shrink-0\">
          <div>
            <h2 className=\"text-slate-900 font-black text-xl leading-none\">Gestão de Acessos</h2>
            <p className=\"text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest\">Controle de Códigos e Prazos</p>
          </div>
          <button 
            onClick={() => { setShowForm(!showForm); setNewCode('') }}
            className=\"flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-slate-200\"
          >
            <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2.5\" d=\"M12 4v16m8-8H4\"/></svg>
            GERAR NOVO CÓDIGO
          </button>
        </header>

        <div className=\"flex-1 overflow-y-auto p-10 bg-slate-50/50\">
          <div className=\"max-w-6xl mx-auto\">
            {newCode && (
              <div className=\"bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 mb-10 flex items-center justify-between shadow-sm\">
                <div>
                  <p className=\"text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-2\">Código Criado com Sucesso</p>
                  <p className=\"text-slate-900 font-mono text-4xl font-black tracking-[0.2em]\">{newCode}</p>
                  <p className=\"text-slate-400 text-xs mt-2 font-medium\">Informe este código ao aluno antes do início da prova.</p>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(newCode) }}
                  className=\"bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black text-xs transition-all\"
                >
                  COPIAR CÓDIGO
                </button>
              </div>
            )}

            {showForm && (
              <div className=\"bg-white border border-slate-100 rounded-[2.5rem] p-10 mb-10 shadow-sm\">
                <h3 className=\"text-slate-900 font-black text-lg mb-8 uppercase tracking-tight\">Novo Código de Acesso</h3>
                <form onSubmit={handleCreate} className=\"grid grid-cols-1 md:grid-cols-2 gap-8\">
                  <div className=\"md:col-span-2 space-y-2\">
                    <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Avaliação Vinculada</label>
                    <select
                      value={form.exam_id}
                      onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))}
                      required
                      className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer\"
                    >
                      <option value=\"\">Selecione uma prova...</option>
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                  </div>
                  <div className=\"space-y-2\">
                    <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Válido a partir de</label>
                    <input
                      type=\"datetime-local\"
                      value={form.valid_from}
                      onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                      required
                      className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold\"
                    />
                  </div>
                  <div className=\"space-y-2\">
                    <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Válido até</label>
                    <input
                      type=\"datetime-local\"
                      value={form.valid_until}
                      onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                      required
                      className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold\"
                    />
                  </div>
                  <div className=\"md:col-span-2 flex gap-4 pt-4\">
                    <button type=\"submit\" disabled={creating} className=\"flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl text-sm transition-all transform hover:-translate-y-1\">
                      {creating ? 'GERANDO...' : 'GERAR CÓDIGO DE ACESSO'}
                    </button>
                    <button type=\"button\" onClick={() => setShowForm(false)} className=\"px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all\">
                      CANCELAR
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className=\"flex justify-center py-20\">
                <div className=\"w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin\"></div>
              </div>
            ) : tokens.length === 0 ? (
              <div className=\"text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200\">
                <div className=\"w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6\">
                  <svg className=\"w-10 h-10 text-slate-300\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z\"/></svg>
                </div>
                <h4 className=\"text-slate-900 font-black text-xl mb-2\">Nenhum Código Gerado</h4>
                <p className=\"text-slate-400 max-w-xs mx-auto mb-8 font-medium\">Gere códigos de acesso para permitir que seus alunos iniciem as avaliações.</p>
              </div>
            ) : (
              <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                {tokens.map(token => {
                  const expired = isExpired(token.valid_until)
                  return (
                    <div key={token.id} className=\"group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all p-8 flex flex-col relative overflow-hidden\">
                      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12 transition-colors ${expired ? 'bg-rose-500' : token.active ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                      
                      <div className=\"flex items-center justify-between mb-5 relative z-10\">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          expired ? 'bg-rose-50 text-rose-500 border-rose-100' :
                          token.active ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {expired ? 'Expirado' : token.active ? 'Ativo' : 'Pausado'}
                        </span>
                        <p className=\"text-slate-400 text-[10px] font-black tracking-widest uppercase\">
                          {new Date(token.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className=\"mb-6 relative z-10\">
                        <h4 className=\"text-slate-900 font-black text-2xl tracking-[0.1em] mb-1\">{token.code}</h4>
                        <p className=\"text-slate-400 text-xs font-bold uppercase truncate tracking-tight\">{token.exam_title}</p>
                      </div>

                      <div className=\"space-y-1 mb-8 relative z-10\">
                        <p className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest\">Validade</p>
                        <p className=\"text-slate-600 text-xs font-bold leading-none\">
                          De {new Date(token.valid_from).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className=\"text-slate-600 text-xs font-bold\">
                          Até {new Date(token.valid_until).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className=\"mt-auto pt-6 border-t border-slate-50 flex gap-2 relative z-10\">
                        <button
                          onClick={() => navigator.clipboard.writeText(token.code)}
                          className=\"flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all\"
                        >
                          Copiar
                        </button>
                        <button
                          onClick={() => toggleActive(token.id, token.active)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                            token.active ? 'bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white' : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white'
                          }`}
                        >
                          {token.active ? 'Pausar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => deleteToken(token.id)}
                          className=\"px-3 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">
                      
                          <svg className=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\"/></svg>
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
