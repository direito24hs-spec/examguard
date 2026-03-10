import { useParams, useNavigate } from 'react-router-dom';

export default function ExamInstructions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const name = sessionStorage.getItem('student_name');

  if (!name) {
    navigate(`/exam/${examId}/identify`);
    return null;
  }

  const handleStart = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    navigate(`/exam/${examId}/session`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">Instrucoes da Prova</h1>
        <div className="space-y-3 text-slate-300 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 text-lg mt-0.5">⚠</span>
            <p>Nao minimize ou troque de aba/janela durante a prova. Cada saida sera registrada como violacao e pode acarretar penalidade.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">🚫</span>
            <p>Copiar e colar texto das questoes e bloqueado. Nao tente usar teclas de atalho para copiar.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-lg mt-0.5">⏱</span>
            <p>O tempo e contado a partir do momento que voce iniciar a prova. Ao acabar o tempo, a prova sera enviada automaticamente.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-lg mt-0.5">✓</span>
            <p>Responda todas as questoes antes de enviar. Voce pode revisar suas respostas antes da confirmacao final.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-purple-400 text-lg mt-0.5">📱</span>
            <p>Recomendamos usar computador. Se estiver no celular, nao minimize o navegador.</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-white text-sm">Aluno: <span className="font-semibold">{name}</span></p>
          <p className="text-slate-400 text-xs mt-1">Ao clicar em Iniciar, o cronometro comecaraa correr.</p>
        </div>
        <button onClick={handleStart} className="btn-primary w-full text-lg py-3">
          Iniciar Prova
        </button>
      </div>
    </div>
  );
}
