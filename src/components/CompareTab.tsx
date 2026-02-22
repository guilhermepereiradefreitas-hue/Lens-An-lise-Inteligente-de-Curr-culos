import React from 'react';
import { AnalysisResult } from '../types';
import { Users, X } from 'lucide-react';

interface CompareTabProps {
  compareList: AnalysisResult[];
  setCompareList: (list: AnalysisResult[]) => void;
}

export default function CompareTab({ compareList, setCompareList }: CompareTabProps) {
  if (compareList.length === 0) {
    return (
      <div className="text-center py-16 px-8 text-lens-muted text-[0.9rem]">
        <Users size={40} className="mx-auto mb-4 opacity-50" />
        Nenhum candidato adicionado à comparação ainda.<br/>
        Analise candidatos e clique em "+ Adicionar à comparação".
      </div>
    );
  }

  const sortedList = [...compareList].sort((a, b) => b.score - a.score);

  const verdictMap = { 
    GO: { cls: 'bg-lens-accent2/10 text-lens-accent2', label: 'Avançar' }, 
    MAYBE: { cls: 'bg-lens-maybe/10 text-lens-maybe', label: 'Avaliar' }, 
    NO: { cls: 'bg-lens-danger/10 text-lens-danger', label: 'Recusar' } 
  };
  const scoreColor = (s: number) => s >= 70 ? 'var(--color-lens-accent2)' : s >= 50 ? 'var(--color-lens-maybe)' : 'var(--color-lens-danger)';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[0.88rem] text-lens-muted">Compare os candidatos analisados lado a lado.</p>
        <button 
          className="bg-transparent border border-lens-border2 text-lens-muted px-3 py-1.5 rounded-md text-[0.75rem] font-bold hover:border-lens-text hover:text-lens-text transition-colors"
          onClick={() => setCompareList([])}
        >
          Limpar seleção
        </button>
      </div>

      <div className="grid gap-4">
        {sortedList.map((r, idx) => (
          <div key={r.id} className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden">
            <div className="bg-lens-surface2 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-lens-border">
              <div className="flex items-center">
                {idx === 0 && (
                  <span className="text-[0.65rem] bg-lens-accent/15 text-lens-accent px-2 py-1 rounded-md mr-2 font-bold tracking-widest uppercase">
                    MELHOR
                  </span>
                )}
                <span className="font-fraunces text-base font-semibold">{r.name}</span>
                <span className="text-[0.78rem] text-lens-muted ml-2">{r.role}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-block px-2 py-1 rounded text-[0.68rem] font-bold tracking-widest uppercase ${verdictMap[r.verdict].cls}`}>
                  {verdictMap[r.verdict].label}
                </span>
                <span className="font-fraunces text-2xl font-black" style={{ color: scoreColor(r.score) }}>
                  {r.score}
                </span>
                <button 
                  className="bg-transparent border border-lens-danger/30 text-lens-danger px-2 py-1 rounded text-[0.75rem] hover:bg-lens-danger/10 transition-colors"
                  onClick={() => setCompareList(compareList.filter(c => c.id !== r.id))}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            <div className="grid">
              <div className="px-5 py-3.5 border-b border-lens-border grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start text-[0.84rem]">
                <span className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted pt-0.5">Subscores</span>
                <span className="text-[#c8c4bc] leading-relaxed">
                  {r.subscores.map((s, i) => (
                    <React.Fragment key={i}>
                      {s.label}: <strong className="text-lens-text font-semibold">{s.value}</strong>
                      {i < r.subscores.length - 1 && <span className="mx-2 opacity-50">·</span>}
                    </React.Fragment>
                  ))}
                </span>
              </div>
              <div className="px-5 py-3.5 border-b border-lens-border grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start text-[0.84rem]">
                <span className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted pt-0.5">Pontos Fortes</span>
                <span className="text-[#c8c4bc] leading-relaxed flex flex-col gap-1">
                  {r.strengths.map((s, i) => <span key={i}>▲ {s}</span>)}
                </span>
              </div>
              <div className="px-5 py-3.5 border-b border-lens-border grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start text-[0.84rem]">
                <span className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted pt-0.5">Gaps</span>
                <span className="text-[#c8c4bc] leading-relaxed flex flex-col gap-1">
                  {r.gaps.map((g, i) => <span key={i}>▼ {g}</span>)}
                </span>
              </div>
              <div className="px-5 py-3.5 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start text-[0.84rem]">
                <span className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted pt-0.5">Pontos Cegos</span>
                <span className="text-[#c8c4bc] leading-relaxed flex flex-col gap-3">
                  {r.blindspots.map((b, i) => (
                    <span key={i}>⚑ <strong className="text-lens-accent font-semibold">{b.label}</strong>: {b.text}</span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
