import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

interface Option {
  id?: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id?: string;
  exam_id: string;
  type: QuestionType;
  statement: string;
  points: number;
  order_index: number;
  feedback_correct: string;
  feedback_wrong: string;
  options?: Option[];
}

const emptyQuestion = (examId: string, order: number): Question => ({
  exam_id: examId,
  type: 'multiple_choice',
  statement: '',
  points: 1,
  order_index: order,
  feedback_correct: '',
  feedback_wrong: '',
  options: [
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ],
});

export default function QuestionManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [editing, setEditing] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!examId) return;
    supabase.from('exams').select('title').eq('id', examId).single().then(({ data }) => {
      if (data) setExamTitle(data.title);
    });
    loadQuestions();
  }, [examId]);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*, options(*)')
      .eq('exam_id', examId)
      .order('order_index');
    if (data) setQuestions(data as Question[]);
  };

  const saveQuestion = async () => {
    if (!editing) return;
    setLoading(true);
    setMsg('');
    try {
      let qId = editing.id;
      if (qId) {
        await supabase.from('questions').update({
          type: editing.type,
          statement: editing.statement,
          points: editing.points,
          order_index: editing.order_index,
          feedback_correct: editing.feedback_correct,
          feedback_wrong: editing.feedback_wrong,
        }).eq('id', qId);
        await supabase.from('options').delete().eq('question_id', qId);
      } else {
        const { data } = await supabase.from('questions').insert({
          exam_id: examId,
          type: editing.type,
          statement: editing.statement,
          points: editing.points,
          order_index: editing.order_index,
          feedback_correct: editing.feedback_correct,
          feedback_wrong: editing.feedback_wrong,
        }).select().single();
        qId = data?.id;
      }
      if (editing.type !== 'essay' && editing.options && qId) {
        await supabase.from('options').insert(
          editing.options.map(o => ({ question_id: qId, text: o.text, is_correct: o.is_correct }))
        );
      }
      setMsg('Questao salva!');
      setEditing(null);
      await loadQuestions();
    } catch (e: any) {
      setMsg(e.message);
    }
    setLoading(false);
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from('questions').delete().eq('id', id);
    await loadQuestions();
  };

  const updateOption = (idx: number, field: 'text' | 'is_correct', value: string | boolean) => {
    if (!editing) return;
    const opts = [...(editing.options || [])];
    if (field === 'is_correct') {
      opts.forEach((o, i) => o.is_correct = i === idx);
    } else {
      opts[idx] = { ...opts[idx], text: value as string };
    }
    setEditing({ ...editing, options: opts });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate('/professor')} className="text-slate-400 text-sm hover:text-white mb-1">← Voltar</button>
            <h1 className="text-2xl font-bold text-white">Questoes: {examTitle}</h1>
          </div>
          <button onClick={() => setEditing(emptyQuestion(examId!, questions.length + 1))} className="btn-primary">+ Nova Questao</button>
        </div>
        {msg && <p className="text-green-400 text-sm mb-4">{msg}</p>}

        {editing && (
          <div className="card mb-6 space-y-4">
            <h2 className="text-white font-semibold">{editing.id ? 'Editar' : 'Nova'} Questao</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={editing.type} onChange={e => setEditing({...editing, type: e.target.value as QuestionType, options: e.target.value === 'true_false' ? [{text:'Verdadeiro',is_correct:true},{text:'Falso',is_correct:false}] : editing.options})}>
                  <option value="multiple_choice">Multipla escolha</option>
                  <option value="true_false">Verdadeiro/Falso</option>
                  <option value="essay">Dissertativa</option>
                </select>
              </div>
              <div>
                <label className="label">Pontos</label>
                <input type="number" className="input" value={editing.points} onChange={e => setEditing({...editing, points: Number(e.target.value)})} min={0.5} step={0.5} />
              </div>
            </div>
            <div>
              <label className="label">Enunciado</label>
              <textarea className="input" rows={4} value={editing.statement} onChange={e => setEditing({...editing, statement: e.target.value})} placeholder="Texto da questao..." />
            </div>
            {editing.type !== 'essay' && (
              <div>
                <label className="label">Alternativas (marque a correta)</label>
                <div className="space-y-2">
                  {editing.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" name="correct" checked={opt.is_correct} onChange={() => updateOption(i, 'is_correct', true)} className="accent-green-500" />
                      <input className="input flex-1" value={opt.text} onChange={e => updateOption(i, 'text', e.target.value)} placeholder={`Alternativa ${String.fromCharCode(65+i)}`} />
                    </div>
                  ))}
                  {editing.type === 'multiple_choice' && editing.options && editing.options.length < 6 && (
                    <button type="button" onClick={() => setEditing({...editing, options: [...(editing.options||[]), {text:'',is_correct:false}]})} className="text-slate-400 text-sm hover:text-white">+ Adicionar alternativa</button>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Feedback - acerto</label>
                <input className="input" value={editing.feedback_correct} onChange={e => setEditing({...editing, feedback_correct: e.target.value})} placeholder="Excelente! Porque..." />
              </div>
              <div>
                <label className="label">Feedback - erro</label>
                <input className="input" value={editing.feedback_wrong} onChange={e => setEditing({...editing, feedback_wrong: e.target.value})} placeholder="Incorreto. O correto e..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveQuestion} disabled={loading} className="btn-primary">{loading ? 'Salvando...' : 'Salvar Questao'}</button>
              <button onClick={() => setEditing(null)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="card flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-400 text-xs">Q{i+1}</span>
                  <span className="badge-primary text-xs">{q.type === 'multiple_choice' ? 'MC' : q.type === 'true_false' ? 'VF' : 'Dis'}</span>
                  <span className="text-slate-400 text-xs">{q.points}pt</span>
                </div>
                <p className="text-white text-sm line-clamp-2">{q.statement}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => setEditing(q)} className="btn-secondary text-xs">Editar</button>
                <button onClick={() => q.id && deleteQuestion(q.id)} className="btn-danger text-xs">Excluir</button>
              </div>
            </div>
          ))}
          {questions.length === 0 && !editing && (
            <p className="text-slate-400 text-center py-8">Nenhuma questao ainda. Clique em Nova Questao para comecar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
