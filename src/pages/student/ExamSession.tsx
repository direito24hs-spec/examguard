import { useState, useEffect, useRef } from 'react';
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const violationsRef = useRef(0);
  const answersRef = useRef<Record<string, string>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const name = sessionStorage.getItem('student_name') || '';
  const email = sessionStorage.getItem('student_email') || '';

  useEffect(() => {
    if (!examId || !name || !email) { navigate(`/exam/${examId}/identify`); return; }
    loadExam();
  }, [examId]);

  // Keep answersRef in sync
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const loadExam = async () => {
    const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (!examData) { navigate('/'); return; }
    setTimeLeft(examData.duration_minutes * 60);

    const { data: qData } = await supabase
      .from('questions')
      .select('*, options(*)')
      .eq('exam_id', examId)
      .order('order_index');

    let qs = qData as Question[] || [];
    if (examData.randomize_questions) qs = qs.sort(() => Math.random() - 0.5);
    setQuestions(qs);
    sessionStorage.setItem('exam_questions', JSON.stringify(qs));
    setLoading(false);
  };

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          sessionStorage.setItem('exam_answers', JSON.stringify(answersRef.current));
          sessionStorage.setItem('exam_violations', String(violationsRef.current));
          navigate(`/exam/${examId}/confirm`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Anti-cheat: focus monitoring
  useEffect(() => {
    const register = () => {
      violationsRef.current += 1;
      setViolations(violationsRef.current);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
    };
    const handleBlur = () => register();
    const handleVisibility = () => { if (document.hidden) register(); };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Render question as canvas (anti-copy)
  useEffect(() => {
    if (questions.length === 0) return;
    const q = questions[current];
    if (!q) return;
    const canvas = canvasRefs.current[q.id];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const maxW = w - 20;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 300);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '15px sans-serif';
    const words = q.statement.split(' ');
    let line = '';
    let y = 25;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line.trim(), 10, y);
        line = word + ' ';
        y += 24;
      } else line = test;
    }
    if (line.trim()) ctx.fillText(line.trim(), 10, y);
    canvas.dataset.height = String(y + 30);
    canvas.style.height = (y + 30) + 'px';
  }, [questions, current]);

  const goConfirm = () => {
    sessionStorage.setItem('exam_answers', JSON.stringify(answers));
    sessionStorage.setItem('exam_violations', String(violationsRef.current));
    navigate(`/exam/${examId}/confirm`);
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
          <div className="text-slate-400 text-sm">{current + 1}/{questions.length}</div>
        </div>
        <div className="h-1 bg-slate-700">
          <div className="h-1 bg-blue-500" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
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
            width={680}
            height={120}
            className="w-full rounded select-none pointer-events-none"
          />
        </div>

        {q.type !== 'essay' ? (
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
                <span className="font-medium mr-2">{String.fromCharCode(65+i)})</span>{opt.text}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            className="input w-full mb-6"
            rows={6}
            placeholder="Digite sua resposta aqui..."
            value={answers[q.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        )}

        <div className="flex justify-between items-center">
          <button onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current===0} className="btn-secondary">Anterior</button>
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-7 h-7 text-xs rounded ${
                  i===current?'bg-blue-600 text-white':
                  answers[questions[i].id]?'bg-green-700 text-white':'bg-slate-700 text-slate-400'
                }`}>{i+1}</button>
            ))}
          </div>
          {current < questions.length-1
            ? <button onClick={() => setCurrent(c=>c+1)} className="btn-primary">Proxima</button>
            : <button onClick={goConfirm} className="btn-primary bg-green-600 hover:bg-green-500">Revisar e Enviar</button>
          }
        </div>
      </div>
    </div>
  );
}
