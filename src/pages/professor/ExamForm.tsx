import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ExamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [userEmail, setUserEmail] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    mode: 'prova' as 'prova' | 'simulado',
    duration_minutes: 60,
    max_attempts: 1,
    penalty_per_wrong: 0,
    penalty_per_blank: 0,
    allow_penalty: false,
    randomize_questions: false,
    show_feedback_after: 'release' as 'submit' | 'release',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '');
    });
    
    if (isEdit) {
      supabase.from('exams').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm(data as any);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Não autenticado');
      setLoading(false);
      return;
    }

    if (isEdit) {
      const { error: err } = await supabase.from('exams').update(form).eq('id', id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from('exams').insert({ ...form, professor_id: user.id });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    
    navigate('/professor');
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 flex flex-col border-r border-slate-800 shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              onClick={() => navigate('/professor/codigos')}
              className=\"w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all\"
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
            <h2 className=\"text-slate-900 font-black text-xl leading-none\">{isEdit ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
            <p className=\"text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest\">Configurações Gerais</p>
          </div>
        </header>

        <div className=\"flex-1 overflow-y-auto p-10 bg-slate-50/50\">
          <div className=\"max-w-2xl mx-auto\">
            <form onSubmit={handleSubmit} className=\"bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8\">
              {error && (
                <div className=\"p-4 bg-rose-50 border border-rose-100 rounded-2xl\">
                  <p className=\"text-rose-600 text-sm font-bold\">{error}</p>
                </div>
              )}
              
              <div className=\"space-y-2\">
                <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Título da Prova</label>
                <input 
                  className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all\"
                  placeholder=\"Ex: Exame Final de Processo Civil\"
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>

              <div className=\"space-y-2\">
                <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Descrição</label>
                <textarea 
                  className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all\"
                  placeholder=\"Instruções para os alunos...\"
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <div className=\"grid grid-cols-2 gap-6\">
                <div className=\"space-y-2\">
                  <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Modalidade</label>
                  <select 
                    className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer\"
                    value={form.mode} 
                    onChange={e => setForm({...form, mode: e.target.value as any})}
                  >
                    <option value=\"prova\">Prova Oficial</option>
                    <option value=\"simulado\">Simulado Livre</option>
                  </select>
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Duração (min)</label>
                  <input 
                    type=\"number\" 
                    className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all\"
                    value={form.duration_minutes} 
                    onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})} 
                    min={1} 
                  />
                </div>
              </div>

              <div className=\"grid grid-cols-2 gap-6\">
                <div className=\"space-y-2\">
                  <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Máx. Tentativas</label>
                  <input 
                    type=\"number\" 
                    className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all\"
                    value={form.max_attempts} 
                    onChange={e => setForm({...form, max_attempts: Number(e.target.value)})} 
                    min={1} 
                  />
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1\">Liberação de Feedback</label>
                  <select 
                    className=\"w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer\"
                    value={form.show_feedback_after} 
                    onChange={e => setForm({...form, show_feedback_after: e.target.value as any})}
                  >
                    <option value=\"submit\">Ao Enviar</option>
                    <option value=\"release\">Manual (Professor)</option>
                  </select>
                </div>
              </div>

              <div className=\"pt-4 space-y-4\">
                <div className=\"flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100\">
                  <input 
                    type=\"checkbox\" 
                    id=\"allow_penalty\" 
                    className=\"w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500\"
                    checked={form.allow_penalty} 
                    onChange={e => setForm({...form, allow_penalty: e.target.checked})} 
                  />
                  <label htmlFor=\"allow_penalty\" className=\"text-slate-700 text-sm font-bold\">Aplicar penalidade por erros/em branco</label>
                </div>

                {form.allow_penalty && (
                  <div className=\"grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100\">
                    <div className=\"space-y-2\">
                      <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest\">Penalidade Erro (%)</label>
                      <input type=\"number\" className=\"w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold\" value={form.penalty_per_wrong} onChange={e => setForm({...form, penalty_per_wrong: Number(e.target.value)})} min={0} max={100} step={0.5} />
                    </div>
                    <div className=\"space-y-2\">
                      <label className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest\">Penalidade Branco (%)</label>
                      <input type=\"number\" className=\"w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold\" value={form.penalty_per_blank} onChange={e => setForm({...form, penalty_per_blank: Number(e.target.value)})} min={0} max={100} step={0.5} />
                    </div>
                  </div>
                )}

                <div className=\"flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100\">
                  <input 
                    type=\"checkbox\" 
                    id=\"randomize\" 
                    className=\"w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500\"
                    checked={form.randomize_questions} 
                    onChange={e => setForm({...form, randomize_questions: e.target.checked})} 
                  />
                  <label htmlFor=\"randomize\" className=\"text-slate-700 text-sm font-bold\">Embaralhar ordem das questões</label>
                </div>
              </div>

              <div className=\"flex gap-4 pt-6\">
                <button 
                  type=\"submit\" 
                  disabled={loading} 
                  className=\"flex-1 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200\"
                >
                  {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
                <button 
                  type=\"button\" 
                  onClick={() => navigate('/professor')} 
                  className=\"px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all\"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
