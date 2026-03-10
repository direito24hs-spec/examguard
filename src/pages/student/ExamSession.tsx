import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Option { id: string; text: string; }
interface Question {
  id: string;
  type: string;
  statement: string;
  points: number;
  order_index: number;
  options: Option[];
}

export default function ExamSession() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const violationsRef = useRef(0);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const name = sessionStorage.getItem('student_name') || '';
  const email = sessionStorage.getItem('student_email') || '';

  useEffect(() => {
    if (!examId || !name || !email) { navigate(`/exam/${examId}/identify`); return; }
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (!examData) { navigate('/'); return; }
    setExam(examData);
    setTimeLeft(examData.duration_minutes * 60);

    const { data: qData } = await supabase
      .from('questions')
      .select('*, options(*)')
      .eq('exam_id', examId)
      .order('order_index');

    let qs = qData as Question[] || [];
    if (examData.randomize_questions) qs = qs.sort(() => Math.random() - 0.5);
    setQuestions(qs);
    setLoading(false);
  };

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleAutoSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Anti-cheat: focus monitoring
  useEffect(() => {
    const handleBlur = () => {
      violationsRef.current += 1;
      setViolations(violationsRef.current);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
    };
    const handleVisibility = () => {
      if (document.hidden) {
        violationsRef.current += 1;
        setViolations(violationsRef.current);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      }
    };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Anti-cheat: render question text on canvas to prevent copy
  useEffect(() => {
    if (questions.length === 0) return;
    questions.forEach(q => {
      const canvas = canvasRefs.current[q.id];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const maxWidth = canvas.width - 20;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '15px Inter, sans-serif';
      // word-wrap
      const words = q.statement.split(' ');
      let line = '';
      let y = 25;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxWidth && line !== '') {
          ctx.fillText(line, 10, y);
          line = word + ' ';
          y += 22;
        } else { line = test; }
      }
      ctx.fillText(line, 10, y);
      const totalHeight = y + 30;
      canvas.height = totalHeight;
      // Re-draw after height change
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '15px Inter, sans-serif';
      let y2 = 25;
      let line2 = '';
      for (const word of words) {
        const test = line2 + word + ' ';
        if (ctx.measureText(test).width > maxWidth && line2 !== '') {
          ctx.fillText(line2, 10, y2);
          line2 = word + ' ';
          y2 += 22;
        } else { line2 = test; }
      }
      ctx.fillText(line2, 10, y2);
    });
  }, [questions, current]);

  const handleAutoSubmit = useCallback(async () => {
    await submitAnswers();
  }, [answers, violationsRef]);

  const submitAnswers = async () => {
    const { data: sub } = await supabase.from('submissions').insert({
      exam_id: examId,
      student_name: name,
      student_email: email,
      focus_violations: violationsRef.current,
      score: 0,
      max_score: questions.reduce((s, q) => s + q.points, 0),
    }).select().single();
    if (!sub) return;
    const answerRows = questions.map(q => ({
      submission_id: sub.id,
      question_id: q.id,
      option_id: q.type !== 'essay' ? (answers[q.id] || null) : null,
      text_answer: q.type === 'essay' ? (answers[q.id] || '') : null,
      is_correct: false,
    }));
    await supabase.from('answers').insert(answerRows);
    sessionStorage.setItem('submission_id', sub.id);
    navigate(`/exam/${examId}/result`);
  };

  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-white">Carregando...</p></div>;

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-slate-900" onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()}>
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 font-semibold">
          ⚠ Violacao detectada! Saida da prova registrada. ({violations} vez/vezes)
        </div>
      )}
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-sm">{name}</span>
            {violations > 0 && <span className="text-red-400 text-xs">⚠ {violations} violacao(oes)</span>}
          </div>
          <div className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-slate-400 text-sm">{current + 1} / {questions.length}</div>
        </div>
        <div className="h-1 bg-slate-700">
          <div className="h-1 bg-blue-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-primary text-xs">Q{current + 1}</span>
            <span className="text-slate-400 text-xs">{q.points}pt{q.points !== 1 ? 's' : ''}</span>
          </div>
          <canvas
            ref={el => { canvasRefs.current[q.id] = el; }}
            width={700}
            height={80}
            className="w-full rounded select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          />
        </div>

        {q.type !== 'essay' && (
          <div className="space-y-2 mb-6">
            {q.options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  answers[q.id] === opt.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)})</span>
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {q.type === 'essay' && (
          <textarea
            className="input w-full mb-6"
            rows={6}
            placeholder="Digite sua resposta aqui..."
            value={answers[q.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-secondary"
          >Anterior</button>

          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-7 h-7 text-xs rounded ${
                  i === current ? 'bg-blue-600 text-white' :
                  answers[questions[i].id] ? 'bg-green-700 text-white' :
                  'bg-slate-700 text-slate-400'
                }`}
              >{i + 1}</button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)} className="btn-primary">Proxima</button>
          ) : (
            <button onClick={() => navigate(`/exam/${examId}/confirm`)} className="btn-primary bg-green-600 hover:bg-green-500">Revisar e Enviar</button>
          )}
        </div>
      </div>
    </div>
  );
}
