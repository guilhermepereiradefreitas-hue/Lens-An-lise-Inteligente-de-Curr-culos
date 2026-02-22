import React from 'react';
import { AnalysisResult } from '../types';
import { FolderOpen, X } from 'lucide-react';

interface HistoryTabProps {
  history: AnalysisResult[];
  setHistory: (history: AnalysisResult[]) => void;
  onViewResult: (result: AnalysisResult) => void;
}

export default function HistoryTab({ history, setHistory, onViewResult }: HistoryTabProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-16 px-8 text-lens-muted text-[0.9rem]">
        <FolderOpen size={40} className="mx-auto mb-4 opacity-50" />
        Nenhuma análise salva ainda.
      </div>
    );
  }

  const verdictMap = { 
    GO: { cls: 'bg-lens-accent2/10 text-lens-accent2 border-lens-accent2/25', label: 'Avançar' }, 
    MAYBE: { cls: 'bg-lens-maybe/10 text-lens-maybe border-lens-maybe/25', label: 'Avaliar' }, 
    NO: { cls: 'bg-lens-danger/10 text-lens-danger border-lens-danger/25', label: 'Recusar' } 
  };
  const scoreColor = (s: number) => s >= 70 ? 'var(--color-lens-accent2)' : s >= 50 ? 'var(--color-lens-maybe)' : 'var(--color-lens-danger)';

  const clearHistory = () => {
    if (confirm('Apagar todo o histórico?')) {
      setHistory([]);
    }
  };

  const deleteItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setHistory(history.filter(h => h.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[0.88rem] text-lens-muted">Todas as análises realizadas nesta sessão e salvas anteriormente.</p>
        <button 
          className="bg-transparent border border-lens-border2 text-lens-muted px-3 py-1.5 rounded-md text-[0.75rem] font-bold hover:border-lens-text hover:text-lens-text transition-colors"
          onClick={clearHistory}
        >
          Apagar histórico
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {history.map(r => (
          <div 
            key={r.id} 
            className="bg-lens-surface border border-lens-border rounded-lg p-5 grid grid-cols-[1fr_auto] gap-4 items-center cursor-pointer transition-colors hover:border-lens-border2"
            onClick={() => onViewResult(r)}
          >
            <div>
              <div className="font-fraunces text-base font-semibold mb-1">{r.name}</div>
              <div className="text-[0.75rem] text-lens-muted font-mono flex items-center gap-4">
                <span>{r.role}</span>
                <span>{r.date}</span>
                <span className={`inline-block px-2 py-0.5 border rounded text-[0.68rem] font-bold tracking-widest uppercase font-syne ${verdictMap[r.verdict].cls}`}>
                  {verdictMap[r.verdict].label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-fraunces text-3xl font-black leading-none" style={{ color: scoreColor(r.score) }}>
                {r.score}
              </div>
              <button 
                className="bg-transparent border border-lens-danger/30 text-lens-danger px-2 py-1 rounded text-[0.75rem] hover:bg-lens-danger/10 transition-colors"
                onClick={(e) => deleteItem(e, r.id)}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
