import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Exam } from '../../lib/supabase';

export default function ExamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

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
    if (isEdit) {
      supabase.from('exams').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm(data as any);
      });
    }
  }, [id]);

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
      const { error: err } = await supabase.from('exams').insert({ ...form, professor_id: user.id });
      if (err) { setError(err.message); setLoading(false); return; }
    }
    navigate('/professor');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          {isEdit ? 'Editar Prova' : 'Nova Prova'}
        </h1>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div>
            <label className="label">Titulo</label>
            <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="label">Descricao</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Modalidade</label>
              <select className="input" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as any})}>
                <option value="prova">Prova</option>
                <option value="simulado">Simulado</option>
              </select>
            </div>
            <div>
              <label className="label">Duracao (minutos)</label>
              <input type="number" className="input" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})} min={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max tentativas</label>
              <input type="number" className="input" value={form.max_attempts} onChange={e => setForm({...form, max_attempts: Number(e.target.value)})} min={1} />
            </div>
            <div>
              <label className="label">Feedback ao aluno</label>
              <select className="input" value={form.show_feedback_after} onChange={e => setForm({...form, show_feedback_after: e.target.value as any})}>
                <option value="submit">Imediatamente ao enviar</option>
                <option value="release">Somente quando professor liberar</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="allow_penalty" checked={form.allow_penalty} onChange={e => setForm({...form, allow_penalty: e.target.checked})} />
            <label htmlFor="allow_penalty" className="text-slate-300 text-sm">Aplicar penalidade por erros/em branco</label>
          </div>
          {form.allow_penalty && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Penalidade por erro (%)</label>
                <input type="number" className="input" value={form.penalty_per_wrong} onChange={e => setForm({...form, penalty_per_wrong: Number(e.target.value)})} min={0} max={100} step={0.5} />
              </div>
              <div>
                <label className="label">Penalidade em branco (%)</label>
                <input type="number" className="input" value={form.penalty_per_blank} onChange={e => setForm({...form, penalty_per_blank: Number(e.target.value)})} min={0} max={100} step={0.5} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="randomize" checked={form.randomize_questions} onChange={e => setForm({...form, randomize_questions: e.target.checked})} />
            <label htmlFor="randomize" className="text-slate-300 text-sm">Embaralhar questoes</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={() => navigate('/professor')} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
