import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function StudentIdentify() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) return;
    supabase.from('exams').select('title, description, duration_minutes, mode, status').eq('id', examId).single().then(({ data, error }) => {
      if (error || !data) { setError('Prova nao encontrada.'); return; }
      if (data.status !== 'published') { setError('Esta prova nao esta disponivel.'); return; }
      setExam(data);
    });
  }, [examId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Preencha nome e email.'); return; }
    setLoading(true);
    // Check attempt limit
    const { data: prevSubs } = await supabase
      .from('submissions')
      .select('id')
      .eq('exam_id', examId)
      .eq('student_email', email.toLowerCase());
    const { data: examData } = await supabase.from('exams').select('max_attempts').eq('id', examId).single();
    if (prevSubs && examData && prevSubs.length >= examData.max_attempts) {
      setError(`Voce ja atingiu o limite de ${examData.max_attempts} tentativa(s) para esta prova.`);
      setLoading(false);
      return;
    }
    sessionStorage.setItem('student_name', name.trim());
    sessionStorage.setItem('student_email', email.toLowerCase().trim());
    navigate(`/exam/${examId}/instructions`);
  };

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="card max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">{exam?.title}</h1>
          {exam?.description && <p className="text-slate-400 text-sm">{exam.description}</p>}
          <div className="flex justify-center gap-4 mt-3">
            <span className="badge-primary">{exam?.mode === 'prova' ? 'Prova' : 'Simulado'}</span>
            <span className="text-slate-400 text-sm">{exam?.duration_minutes} minutos</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div>
            <label className="label">Seu nome completo</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Nome Sobrenome" required />
          </div>
          <div>
            <label className="label">Seu email institucional</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="aluno@faculdade.edu.br" required />
          </div>
          <button type="submit" disabled={loading || !exam} className="btn-primary w-full">
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
