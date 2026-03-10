import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ExamConfirm() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const name = sessionStorage.getItem('student_name') || '';
  const email = sessionStorage.getItem('student_email') || '';

  useEffect(() => {
    if (!name || !email) navigate(`/exam/${examId}/identify`);
  }, []);

  const getAnswers = (): Record<string, string> => {
    try { return JSON.parse(sessionStorage.getItem('exam_answers') || '{}'); } catch { return {}; }
  };
  const getViolations = () => Number(sessionStorage.getItem('exam_violations') || '0');
  const getQuestions = (): any[] => {
    try { return JSON.parse(sessionStorage.getItem('exam_questions') || '[]'); } catch { return []; }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const answers = getAnswers();
    const questions = getQuestions();
    const violations = getViolations();
    const maxScore = questions.reduce((s: number, q: any) => s + q.points, 0);

    const { data: sub, error: subErr } = await supabase.from('submissions').insert({
      exam_id: examId,
      student_name: name,
      student_email: email,
      focus_violations: violations,
      score: 0,
      max_score: maxScore,
    }).select().single();

    if (subErr || !sub) {
      setError('Erro ao salvar submissao: ' + (subErr?.message || 'unknown'));
      setSubmitting(false);
      return;
    }

    const answerRows = questions.map((q: any) => ({
      submission_id: sub.id,
      question_id: q.id,
      option_id: q.type !== 'essay' ? (answers[q.id] || null) : null,
      text_answer: q.type === 'essay' ? (answers[q.id] || '') : null,
      is_correct: false,
    }));

    const { error: ansErr } = await supabase.from('answers').insert(answerRows);
    if (ansErr) {
      setError('Erro ao salvar respostas: ' + ansErr.message);
      setSubmitting(false);
      return;
    }

    // Calcular score automaticamente via RPC
    await supabase.rpc('calculate_submission_score', { p_submission_id: sub.id });

    sessionStorage.setItem('submission_id', sub.id);
    navigate(`/exam/${examId}/result`);
  };

  const questions = getQuestions();
  const answers = getAnswers();
  const answered = Object.keys(answers).filter(k => answers[k]).length;
  const total = questions.length;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="card max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">Confirmar Envio</h1>
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          <p className="text-slate-300 text-sm">Aluno: <span className="text-white font-semibold">{name}</span></p>
          <p className="text-slate-300 text-sm">
            Questoes respondidas: <span className={`font-semibold ${answered < total ? 'text-yellow-400' : 'text-green-400'}`}>{answered}/{total}</span>
          </p>
          {answered < total && (
            <p className="text-yellow-400 text-xs">⚠ Voce tem {total - answered} questao(oes) sem resposta.</p>
          )}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <p className="text-slate-400 text-sm text-center">Ao confirmar, sua prova sera enviada e nao podera ser alterada.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/exam/${examId}/session`)} className="btn-secondary flex-1">← Voltar e Revisar</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Enviando...' : 'Confirmar Envio'}
          </button>
        </div>
      </div>
    </div>
  );
}
