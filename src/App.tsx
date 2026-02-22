import { useState, useEffect } from 'react';
import { AnalysisResult } from './types';
import AnalyzeTab from './components/AnalyzeTab';
import CompareTab from './components/CompareTab';
import HistoryTab from './components/HistoryTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'history'>('analyze');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [compareList, setCompareList] = useState<AnalysisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lens-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const saveHistory = (newHistory: AnalysisResult[]) => {
    setHistory(newHistory);
    localStorage.setItem('lens-history', JSON.stringify(newHistory));
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setCurrentResult(result);
    saveHistory([result, ...history]);
  };

  const addToCompare = (result: AnalysisResult) => {
    if (!compareList.find(c => c.id === result.id)) {
      setCompareList([...compareList, result]);
    }
  };

  const viewHistoryResult = (result: AnalysisResult) => {
    setCurrentResult(result);
    setActiveTab('analyze');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b border-lens-border px-8 flex items-center h-14 sticky top-0 z-50 bg-lens-bg/95 backdrop-blur-md">
        <div className="font-fraunces text-2xl font-black tracking-tight mr-8">
          L<em className="text-lens-accent not-italic">e</em>ns
        </div>
        <div className="flex h-full">
          <button
            className={`px-5 h-full flex items-center text-[0.78rem] font-bold tracking-widest uppercase border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analyze' ? 'text-lens-accent border-lens-accent' : 'text-lens-muted border-transparent hover:text-lens-text'
            }`}
            onClick={() => setActiveTab('analyze')}
          >
            Analisar
          </button>
          <button
            className={`px-5 h-full flex items-center text-[0.78rem] font-bold tracking-widest uppercase border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'compare' ? 'text-lens-accent border-lens-accent' : 'text-lens-muted border-transparent hover:text-lens-text'
            }`}
            onClick={() => setActiveTab('compare')}
          >
            Comparar {compareList.length > 0 && <span className="ml-1 text-[0.65rem] opacity-60">({compareList.length})</span>}
          </button>
          <button
            className={`px-5 h-full flex items-center text-[0.78rem] font-bold tracking-widest uppercase border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'history' ? 'text-lens-accent border-lens-accent' : 'text-lens-muted border-transparent hover:text-lens-text'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </button>
        </div>
        <div className="flex-1"></div>
        <div className="font-mono text-[0.7rem] bg-lens-surface2 border border-lens-border2 text-lens-muted px-3 py-1 rounded-full">
          {history.length} análise{history.length !== 1 ? 's' : ''}
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-[1300px] mx-auto w-full">
        {activeTab === 'analyze' && (
          <AnalyzeTab 
            currentResult={currentResult} 
            setCurrentResult={setCurrentResult}
            onAnalysisComplete={handleAnalysisComplete}
            onAddToCompare={addToCompare}
          />
        )}
        {activeTab === 'compare' && (
          <CompareTab 
            compareList={compareList} 
            setCompareList={setCompareList} 
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab 
            history={history} 
            setHistory={saveHistory}
            onViewResult={viewHistoryResult}
          />
        )}
      </main>

      <footer className="border-t border-lens-border mt-auto py-5 px-8 flex items-center justify-between flex-wrap gap-2 bg-lens-surface">
        <div className="flex items-center gap-3">
          <span className="font-fraunces font-black text-base tracking-tight">L<span className="text-lens-accent">e</span>ns</span>
          <span className="w-px h-3.5 bg-lens-border2 inline-block"></span>
          <span className="font-mono text-[0.7rem] text-lens-muted">v2.1.0</span>
          <span className="w-px h-3.5 bg-lens-border2 inline-block"></span>
          <span className="text-xs text-lens-muted">Análise Inteligente de Currículos</span>
        </div>
        <div className="text-[0.72rem] text-lens-muted text-right leading-relaxed">
          Desenvolvido por <span className="text-lens-text font-semibold">Guilherme Pereira</span>
          <span className="mx-1.5 opacity-40">·</span>
          © 2026 Lens. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
