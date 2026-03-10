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
    if (!user) { setError('Nao autenticado'); setLoading(false); return; }
    if (isEdit) {
      const { error: err } = await supabase.from('exams').update(form).eq('id', id);
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.from('exams').insert({
        ...form,
        professor_id: user.id,
        created_by: user.id,
        status: 'draft',
      });
      if (err) { setError(err.message); setLoading(false); return; }
    }
    navigate('/professor');
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 flex flex-col p-6 gap-6 flex-shrink-0">
        <div className="mb-4">
          <h1 className="text-white font-black text-lg">Prova Segura</h1>
          <p className="text-slate-400 text-xs">Brito Advogados</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => navigate('/professor')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all">Dashboard</button>
          <button onClick={() => navigate('/professor/codigos')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all">Acessos</button>
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Conta Ativa</p>
          <p className="text-slate-300 text-sm font-medium truncate">{userEmail}</p>
          <button onClick={handleSignOut} className="mt-3 w-full text-left text-red-400 hover:text-red-300 text-sm font-bold transition-colors">Sair da Sessao</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8">
            {isEdit ? 'Editar Avaliacao' : 'Nova Avaliacao'}
          </h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
            <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">Configuracoes Gerais</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">{error}</div>
            )}

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Titulo da Prova</label>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="Ex: Exame Final de Processo Civil" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Descricao</label>
              <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="Instrucoes para os alunos..." rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Modalidade</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as any})}>
                  <option value="prova">Prova Oficial</option>
                  <option value="simulado">Simulado Livre</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Duracao (min)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})} min={1} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Max. Tentativas</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={form.max_attempts} onChange={e => setForm({...form, max_attempts: Number(e.target.value)})} min={1} />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Liberacao de Feedback</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer" value={form.show_feedback_after} onChange={e => setForm({...form, show_feedback_after: e.target.value as any})}>
                  <option value="submit">Ao Enviar</option>
                  <option value="release">Manual (Professor)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" id="allow_penalty" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={form.allow_penalty} onChange={e => setForm({...form, allow_penalty: e.target.checked})} />
                <label htmlFor="allow_penalty" className="text-slate-700 text-sm font-bold">Aplicar penalidade por erros/em branco</label>
              </div>
              {form.allow_penalty && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Penalidade Erro (%)</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold" value={form.penalty_per_wrong} onChange={e => setForm({...form, penalty_per_wrong: Number(e.target.value)})} min={0} max={100} step={0.5} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Penalidade Branco (%)</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold" value={form.penalty_per_blank} onChange={e => setForm({...form, penalty_per_blank: Number(e.target.value)})} min={0} max={100} step={0.5} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" id="randomize" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={form.randomize_questions} onChange={e => setForm({...form, randomize_questions: e.target.checked})} />
                <label htmlFor="randomize" className="text-slate-700 text-sm font-bold">Embaralhar ordem das questoes</label>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200">
                {loading ? 'SALVANDO...' : 'SALVAR ALTERACOES'}
              </button>
              <button type="button" onClick={() => navigate('/professor')} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all">CANCELAR</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
