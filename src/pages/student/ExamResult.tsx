import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ExamResult() {
  const { examId } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const submissionId = sessionStorage.getItem('submission_id');

  useEffect(() => {
    if (!submissionId || !examId) return;
    Promise.all([
      supabase.from('submissions').select('*').eq('id', submissionId).single(),
      supabase.from('exams').select('*').eq('id', examId).single(),
      supabase.from('answers').select('*, question:questions(statement, feedback_correct, feedback_wrong, points, type), option:options(text, is_correct)').eq('submission_id', submissionId),
    ]).then(([{ data: sub }, { data: ex }, { data: ans }]) => {
      setSubmission(sub);
      setExam(ex);
      setAnswers(ans || []);
      setLoading(false);
    });
  }, [submissionId, examId]);

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-white">Carregando...</p></div>;

  const released = exam?.results_released || exam?.show_feedback_after === 'submit';

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Prova Enviada!</h1>
          <p className="text-slate-300">Obrigado, <span className="font-semibold text-white">{submission?.student_name}</span>.</p>
          {submission?.focus_violations > 0 && (
            <p className="text-red-400 text-sm mt-2">⚠ {submission.focus_violations} violacao(oes) de foco foram registradas.</p>
          )}
          {!released && (
            <div className="mt-4 bg-slate-800 rounded-lg p-4">
              <p className="text-slate-300 text-sm">Sua prova foi recebida com sucesso.</p>
              <p className="text-slate-400 text-xs mt-1">Os resultados serao divulgados pelo professor em breve.</p>
            </div>
          )}
        </div>

        {released && (
          <div className="space-y-4">
            <div className="card text-center">
              <p className="text-4xl font-bold text-white">{((submission.score / submission.max_score) * 100).toFixed(1)}%</p>
              <p className="text-slate-400">{submission.score}/{submission.max_score} pontos</p>
            </div>

            <h2 className="text-white font-semibold text-lg">Gabarito e Feedback</h2>
            {answers.map((ans: any, i: number) => (
              <div key={ans.id} className={`card border ${
                ans.is_correct ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'
              }`}>
                <p className="text-white text-sm font-medium mb-2">Q{i+1}: {ans.question?.statement}</p>
                {ans.option && (
                  <p className="text-slate-300 text-xs">Sua resposta: <span className={ans.is_correct ? 'text-green-400' : 'text-red-400'}>{ans.option.text}</span></p>
                )}
                {ans.text_answer && (
                  <p className="text-slate-300 text-xs">Sua resposta: {ans.text_answer}</p>
                )}
                <p className={`text-sm mt-2 font-medium ${
                  ans.is_correct ? 'text-green-400' : 'text-red-400'
                }`}>
                  {ans.is_correct ? '✓ Correto' : '✗ Incorreto'}
                </p>
                {(ans.is_correct ? ans.question?.feedback_correct : ans.question?.feedback_wrong) && (
                  <p className="text-slate-300 text-xs mt-1 italic">
                    {ans.is_correct ? ans.question?.feedback_correct : ans.question?.feedback_wrong}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
