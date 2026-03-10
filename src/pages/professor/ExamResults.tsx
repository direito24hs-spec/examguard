import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Submission {
  id: string;
  student_name: string;
  student_email: string;
  score: number;
  max_score: number;
  submitted_at: string;
  focus_violations: number;
  answers: any[];
}

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (!examId) return;
    supabase.from('exams').select('*').eq('id', examId).single().then(({ data }) => setExam(data));
    loadSubmissions();
  }, [examId]);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*, answers(*, question:questions(statement, feedback_correct, feedback_wrong, points), option:options(text, is_correct))')
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false });
    if (data) setSubmissions(data as any);
  };

  const releaseResults = async () => {
    setReleasing(true);
    await supabase.from('exams').update({ results_released: true }).eq('id', examId);
    setExam((e: any) => ({ ...e, results_released: true }));
    setReleasing(false);
  };

  const avg = submissions.length
    ? (submissions.reduce((s, sub) => s + (sub.score / sub.max_score) * 100, 0) / submissions.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate('/professor')} className="text-slate-400 text-sm hover:text-white mb-1">← Voltar</button>
            <h1 className="text-2xl font-bold text-white">Resultados: {exam?.title}</h1>
          </div>
          {!exam?.results_released && (
            <button onClick={releaseResults} disabled={releasing} className="btn-primary">
              {releasing ? 'Liberando...' : 'Liberar Resultados'}
            </button>
          )}
          {exam?.results_released && (
            <span className="bg-purple-700 text-purple-100 text-sm px-3 py-1 rounded-full">Resultados liberados</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-white">{submissions.length}</p>
            <p className="text-slate-400 text-sm">Submissoes</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-400">{avg}%</p>
            <p className="text-slate-400 text-sm">Media</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {submissions.filter(s => s.focus_violations > 0).length}
            </p>
            <p className="text-slate-400 text-sm">Com violacoes de foco</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {submissions.map(sub => (
              <div
                key={sub.id}
                onClick={() => setSelected(sub)}
                className={`card cursor-pointer hover:border-slate-500 border border-slate-700 ${
                  selected?.id === sub.id ? 'border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{sub.student_name}</p>
                    <p className="text-slate-400 text-xs">{sub.student_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{((sub.score / sub.max_score) * 100).toFixed(1)}%</p>
                    <p className="text-slate-400 text-xs">{sub.score}/{sub.max_score}pts</p>
                  </div>
                </div>
                {sub.focus_violations > 0 && (
                  <p className="text-red-400 text-xs mt-1">⚠ {sub.focus_violations} violacao(oes) de foco</p>
                )}
              </div>
            ))}
            {submissions.length === 0 && (
              <p className="text-slate-400 text-center py-8">Nenhuma submissao ainda.</p>
            )}
          </div>

          {selected && (
            <div className="card space-y-3 overflow-y-auto max-h-screen">
              <h2 className="text-white font-semibold">{selected.student_name}</h2>
              <p className="text-slate-400 text-sm">Nota: {((selected.score / selected.max_score) * 100).toFixed(1)}% ({selected.score}/{selected.max_score}pts)</p>
              {selected.focus_violations > 0 && (
                <p className="text-red-400 text-sm">⚠ {selected.focus_violations} violacao(oes) de foco detectada(s)</p>
              )}
              <hr className="border-slate-700" />
              {(selected.answers as any[]).map((ans: any, i: number) => (
                <div key={ans.id} className={`p-3 rounded-lg ${
                  ans.is_correct ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
                }`}>
                  <p className="text-white text-sm font-medium mb-1">Q{i+1}: {ans.question?.statement}</p>
                  {ans.option && <p className="text-slate-300 text-xs">Resposta: {ans.option.text}</p>}
                  {ans.text_answer && <p className="text-slate-300 text-xs">Resposta: {ans.text_answer}</p>}
                  <p className={`text-xs mt-1 ${ans.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                    {ans.is_correct ? ans.question?.feedback_correct : ans.question?.feedback_wrong}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
