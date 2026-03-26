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
  ],
});

export default function QuestionManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examId) fetchQuestions();
  }, [examId]);

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*, options(*)')
      .eq('exam_id', examId)
      .order('order_index', { ascending: true });

    if (!error && data) setQuestions(data);
    setLoading(false);
  }

  function addQuestion() {
    setQuestions([...questions, emptyQuestion(examId!, questions.length)]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  }

  function addOption(qIndex: number) {
    const newQuestions = [...questions];
    const options = newQuestions[qIndex].options || [];
    newQuestions[qIndex].options = [...options, { text: '', is_correct: false }];
    setQuestions(newQuestions);
  }

  function updateOption(qIndex: number, oIndex: number, text: string) {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options![oIndex].text = text;
    }
    setQuestions(newQuestions);
  }

  function setCorrectOption(qIndex: number, oIndex: number) {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options!.forEach((opt, i) => {
        opt.is_correct = i === oIndex;
      });
    }
    setQuestions(newQuestions);
  }

  async function saveAll() {
    setSaving(true);
    try {
      await supabase.from('questions').delete().eq('exam_id', examId);
      
      for (const q of questions) {
        const { data: newQ, error: qErr } = await supabase
          .from('questions')
          .insert({
            exam_id: q.exam_id,
            type: q.type,
            statement: q.statement,
            points: q.points,
            order_index: q.order_index,
            feedback_correct: q.feedback_correct,
            feedback_wrong: q.feedback_wrong,
          })
          .select()
          .single();

        if (qErr) throw qErr;

        if (q.type !== 'essay' && q.options) {
          const optionsToInsert = q.options.map(o => ({
            question_id: newQ.id,
            text: o.text,
            is_correct: o.is_correct
          }));
          await supabase.from('options').insert(optionsToInsert);
        }
      }
      alert('Questoes salvas com sucesso!');
      navigate(`/professor/exams/${examId}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar questoes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-900 flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/professor)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">Gerenciar Questoes</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Editor de Avaliacao</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addQuestion}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all border border-slate-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Adicionar Questao
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-blue-100"
          >
            {saving ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/20 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                    {qIndex + 1}
                  </span>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, { type: e.target.value as QuestionType })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="multiple_choice">Multipla Escolha</option>
                    <option value="true_false">Verdadeiro ou Falso</option>
                    <option value="essay">Dissertativa</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase">Pontos:</span>
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) })}
                      className="w-12 bg-transparent text-sm font-black text-blue-700 outline-none text-center"
                    />
                  </div>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Enunciado da Questao</label>
                  <textarea
                    value={q.statement}
                    onChange={(e) => updateQuestion(qIndex, { statement: e.target.value })}
                    placeholder="Digite aqui a pergunta..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] shadow-inner"
                  />
                </div>

                {q.type !== 'essay' && (
                  <div className="space-y-3">
                    <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1 text-center">Alternativas</label>
                    <div className="grid gap-3">
                      {q.options?.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <button
                            onClick={() => setCorrectOption(qIndex, oIndex)}
                            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                              opt.is_correct 
                                ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                                : 'bg-white border-slate-200 text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {opt.is_correct ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-tighter">Correta</span>
                            )}
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Alternativa ${oIndex + 1}`}
                            className={`flex-1 bg-white border-2 rounded-2xl px-5 py-3 text-sm focus:ring-2 outline-none transition-all ${
                              opt.is_correct ? 'border-emerald-200 focus:ring-emerald-500' : 'border-slate-100 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addOption(qIndex)}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      Adicionar Alternativa
                    </button>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-6">
                  <div>
                    <label className="block text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Feedback Acerto (Opcional)</label>
                    <input
                      type="text"
                      value={q.feedback_correct}
                      onChange={(e) => updateQuestion(qIndex, { feedback_correct: e.target.value })}
                      placeholder="Parabens! Voce acertou..."
                      className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-2.5 text-sm placeholder-emerald-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-600 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Feedback Erro (Opcional)</label>
                    <input
                      type="text"
                      value={q.feedback_wrong}
                      onChange={(e) => updateQuestion(qIndex, { feedback_wrong: e.target.value })}
                      placeholder="Nao foi desta vez. O correto seria..."
                      className="w-full bg-rose-50/30 border border-rose-100 rounded-xl px-4 py-2.5 text-sm placeholder-rose-200 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[40px]">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Editor Vazio</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Sua prova ainda nao possui questoes. Clique no botao acima para comecar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
