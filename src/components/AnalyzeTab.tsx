import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { analyzeResume } from '../services/geminiService';
import { FileText, CheckCircle2, ArrowRight, Plus, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalyzeTabProps {
  currentResult: AnalysisResult | null;
  setCurrentResult: (result: AnalysisResult | null) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAddToCompare: (result: AnalysisResult) => void;
}

export default function AnalyzeTab({ currentResult, setCurrentResult, onAnalysisComplete, onAddToCompare }: AnalyzeTabProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Por favor, envie um arquivo PDF.');
      return;
    }
    setError('');
    setFileName(file.name);
    
    try {
      const buf = await file.arrayBuffer();
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      let txt = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        txt += content.items.map(s => s.str).join(' ') + '\\n';
      }
      setPdfText(txt.trim());
    } catch (err) {
      setError('Erro ao ler o PDF. Tente outro arquivo.');
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!pdfText) {
      setError('Por favor, faça o upload do currículo em PDF.');
      return;
    }
    if (!jobDesc.trim()) {
      setError('Por favor, cole a descrição da vaga.');
      return;
    }

    const candidateName = name.trim() || 'Candidato';
    const roleTitle = role.trim() || 'Vaga';

    setError('');
    setIsLoading(true);
    setLoadingStep('Lendo currículo...');
    setLoadingProgress(10);

    try {
      setTimeout(() => { setLoadingStep('Comparando com a vaga...'); setLoadingProgress(35); }, 800);
      setTimeout(() => { setLoadingStep('Identificando pontos cegos...'); setLoadingProgress(60); }, 1600);
      setTimeout(() => { setLoadingStep('Gerando análise com IA...'); setLoadingProgress(75); }, 2400);

      const resultData = await analyzeResume(candidateName, roleTitle, pdfText, jobDesc);
      
      setLoadingStep('Pronto!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        const fullResult: AnalysisResult = {
          ...resultData,
          id: Date.now(),
          name: candidateName,
          role: roleTitle,
          date: new Date().toLocaleDateString('pt-BR')
        };
        onAnalysisComplete(fullResult);
        setIsLoading(false);
      }, 500);

    } catch (err: any) {
      setIsLoading(false);
      setError('Erro na análise: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const exportPDF = () => {
    if (!currentResult) return;
    const r = currentResult;
    const verdictLabel = { GO: '✓ Avançar', MAYBE: '◎ Avaliar com Atenção', NO: '✕ Não Recomendado' };
    const scoreColor = r.score >= 70 ? '#1a7a50' : r.score >= 50 ? '#a06010' : '#a02010';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Lens — ${r.name}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 3rem 2rem; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 2rem; font-family: monospace; }
    .score-row { display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; padding: 1.5rem; border: 2px solid #eee; border-radius: 8px; }
    .score-big { font-size: 4rem; font-weight: 900; color: ${scoreColor}; line-height: 1; }
    .verdict { display: inline-block; padding: 0.3rem 0.8rem; background: #f5f5f5; border-radius: 100px; font-size: 0.85rem; font-family: sans-serif; margin-bottom: 0.5rem; }
    .summary { color: #555; line-height: 1.7; font-size: 0.95rem; }
    .subscores { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 2rem; }
    .ss { text-align: center; padding: 1rem; border: 1px solid #eee; border-radius: 6px; }
    .ss-val { font-size: 1.5rem; font-weight: 900; }
    .ss-label { font-size: 0.7rem; font-family: sans-serif; color: #888; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.25rem; }
    h2 { font-size: 1rem; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em; color: #888; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin: 1.5rem 0 0.75rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.4rem; font-size: 0.9rem; line-height: 1.6; }
    .blind-item { padding: 0.75rem 1rem; border: 1px solid #f0e090; background: #fffdf0; border-radius: 4px; margin-bottom: 0.75rem; }
    .blind-label { font-size: 0.7rem; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.06em; color: #a06010; margin-bottom: 0.25rem; }
    .blind-text { font-size: 0.87rem; line-height: 1.6; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.75rem; color: #aaa; font-family: sans-serif; }
  </style>
  </head><body>
  <h1>${r.name}</h1>
  <div class="meta">${r.role} · Analisado em ${r.date} · Lens — Análise Inteligente de Currículos</div>
  <div class="score-row">
    <div class="score-big">${r.score}</div>
    <div>
      <div class="verdict">${verdictLabel[r.verdict] || r.verdict}</div>
      <div style="font-size:1.1rem;font-weight:bold;margin-bottom:0.3rem">${r.title}</div>
      <div class="summary">${r.summary}</div>
    </div>
  </div>
  <div class="subscores">${r.subscores.map(s => `<div class="ss"><div class="ss-val">${s.value}</div><div class="ss-label">${s.label}</div></div>`).join('')}</div>
  <h2>Pontos Fortes</h2><ul>${r.strengths.map(i => `<li>${i}</li>`).join('')}</ul>
  <h2>Gaps Identificados</h2><ul>${r.gaps.map(i => `<li>${i}</li>`).join('')}</ul>
  <h2>Pontos Cegos — O que o CV não mostra</h2>${r.blindspots.map(b => `<div class="blind-item"><div class="blind-label">⚑ ${b.label}</div><div class="blind-text">${b.text}</div></div>`).join('')}
  <h2>Perguntas para Entrevista</h2><ol>${r.questions.map(i => `<li>${i}</li>`).join('')}</ol>
  <div class="footer">Gerado por Lens · Análise Inteligente de Currículos</div>
  </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lens_${r.name.replace(/\s+/g,'_')}_${r.role.replace(/\s+/g,'_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendWhatsApp = () => {
    if (!currentResult) return;
    const r = currentResult;
    
    let message = '';
    const status = r.verdict === 'NO' ? 'Infelizmente não seguiremos com seu perfil no momento.' : 'Seu currículo foi aprovado para a próxima etapa!';
    
    if (r.verdict !== 'NO') {
      message = `Olá ${r.name}, aqui é da empresa ${companyName || 'Lens'}. ${status}\n\nGostaríamos de agendar uma entrevista:\n📅 Data: ${interviewDate || '___'}\n🕒 Hora: ${interviewTime || '___'}\n📍 Local: ${interviewLocation || '___'}\n\nPor favor, confirme se você pode comparecer.`;
    } else {
      message = `Olá ${r.name}, aqui é da empresa ${companyName || 'Lens'}. ${status}\n\nAgradecemos seu interesse na vaga de ${r.role}. Manteremos seu currículo em nosso banco de talentos para futuras oportunidades.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const phone = candidatePhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  if (currentResult) {
    const r = currentResult;
    const verdictMap = { 
      GO: { cls: 'bg-lens-accent2/10 text-lens-accent2 border-lens-accent2/25', label: '✓ Avançar' }, 
      MAYBE: { cls: 'bg-lens-maybe/10 text-lens-maybe border-lens-maybe/25', label: '◎ Avaliar' }, 
      NO: { cls: 'bg-lens-danger/10 text-lens-danger border-lens-danger/25', label: '✕ Não recomendado' } 
    };
    const v = verdictMap[r.verdict] || verdictMap.MAYBE;
    const scoreColor = r.score >= 70 ? 'var(--color-lens-accent2)' : r.score >= 50 ? 'var(--color-lens-maybe)' : 'var(--color-lens-danger)';
    const ssColors = ['var(--color-lens-accent2)', 'var(--color-lens-accent)', 'var(--color-lens-maybe)', 'var(--color-lens-muted)'];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <button 
            className="bg-transparent border border-lens-border2 text-lens-muted px-4 py-2 rounded-md text-[0.78rem] font-bold hover:border-lens-text hover:text-lens-text transition-colors flex items-center gap-2"
            onClick={() => setCurrentResult(null)}
          >
            ← Nova análise
          </button>
          <div className="font-fraunces text-xl font-semibold flex-1">{r.name} — {r.role}</div>
        </div>

        <div className="bg-lens-surface border border-lens-border rounded-lg p-8 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-8 items-center mb-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(232,197,71,0.07)_0%,transparent_70%)] pointer-events-none"></div>
          
          <div className="relative w-[130px] h-[130px] mx-auto md:mx-0">
            <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
              <circle cx="65" cy="65" r="54" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-lens-border2" />
              <motion.circle 
                cx="65" cy="65" r="54" fill="none" strokeWidth="9" strokeLinecap="round" 
                style={{ stroke: scoreColor }}
                strokeDasharray={339}
                initial={{ strokeDashoffset: 339 }}
                animate={{ strokeDashoffset: 339 - (339 * r.score / 100) }}
                transition={{ duration: 1.3, ease: [0.2, 0, 0.2, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-fraunces font-black text-4xl leading-none">
              <NumberCounter from={0} to={r.score} duration={1.2} />
              <small className="text-[0.65rem] font-mono text-lens-muted font-normal mt-0.5">/ 100</small>
            </div>
          </div>

          <div>
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.72rem] font-bold tracking-wider uppercase border mb-2.5 ${v.cls}`}>
              {v.label}
            </div>
            <div className="font-fraunces text-2xl font-semibold mb-2 leading-tight">{r.title}</div>
            <div className="text-[0.88rem] text-lens-muted leading-relaxed">{r.summary}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {r.subscores.map((s, i) => (
            <div key={i} className="bg-lens-surface border border-lens-border rounded-md p-4">
              <div className="text-[0.68rem] font-bold tracking-widest uppercase text-lens-muted mb-2">{s.label}</div>
              <div className="font-fraunces text-2xl font-black leading-none mb-2" style={{ color: ssColors[i % 4] }}>{s.value}</div>
              <div className="h-[3px] bg-lens-border2 rounded-sm overflow-hidden">
                <motion.div 
                  className="h-full rounded-sm" 
                  style={{ backgroundColor: ssColors[i % 4] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-lens-border flex items-center gap-2.5 text-[0.72rem] font-bold tracking-widest uppercase text-lens-muted bg-lens-surface2">
              ✦ Pontos Fortes
            </div>
            <div className="p-5">
              <ul className="flex flex-col gap-3">
                {r.strengths.map((s, i) => (
                  <li key={i} className="text-[0.85rem] leading-relaxed pl-5 relative text-[#c8c4bc]">
                    <span className="absolute left-0 top-[0.25em] text-[0.6rem] text-lens-accent2">▲</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-lens-border flex items-center gap-2.5 text-[0.72rem] font-bold tracking-widest uppercase text-lens-muted bg-lens-surface2">
              △ Gaps Identificados
            </div>
            <div className="p-5">
              <ul className="flex flex-col gap-3">
                {r.gaps.map((g, i) => (
                  <li key={i} className="text-[0.85rem] leading-relaxed pl-5 relative text-[#c8c4bc]">
                    <span className="absolute left-0 top-[0.25em] text-[0.6rem] text-lens-danger">▼</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-lens-surface border border-lens-accent/25 rounded-lg overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-lens-accent/15 flex items-center gap-2.5 text-[0.72rem] font-bold tracking-widest uppercase text-lens-accent bg-lens-accent/5">
            ⚑ Pontos Cegos — O que o CV não mostra
          </div>
          <div className="p-5 flex flex-col gap-3.5">
            {r.blindspots.map((b, i) => (
              <div key={i} className="p-3.5 bg-lens-accent/5 border border-lens-accent/10 rounded-md">
                <div className="text-[0.68rem] font-mono text-lens-accent tracking-widest uppercase mb-1.5 font-medium">
                  ⚑ {b.label}
                </div>
                <div className="text-[0.84rem] leading-relaxed text-[#c8c4bc]">{b.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-lens-border flex items-center gap-2.5 text-[0.72rem] font-bold tracking-widest uppercase text-lens-muted bg-lens-surface2">
            💬 Comunicação via WhatsApp
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-[0.65rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">Data da Entrevista</label>
                <input 
                  type="date" 
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full bg-lens-surface2 border border-lens-border2 rounded-md px-3 py-2 text-lens-text text-[0.82rem] outline-none focus:border-lens-accent"
                />
              </div>
              <div>
                <label className="text-[0.65rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">Hora</label>
                <input 
                  type="time" 
                  value={interviewTime}
                  onChange={e => setInterviewTime(e.target.value)}
                  className="w-full bg-lens-surface2 border border-lens-border2 rounded-md px-3 py-2 text-lens-text text-[0.82rem] outline-none focus:border-lens-accent"
                />
              </div>
              <div>
                <label className="text-[0.65rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">Local / Link</label>
                <input 
                  type="text" 
                  value={interviewLocation}
                  onChange={e => setInterviewLocation(e.target.value)}
                  placeholder="Ex: Google Meet ou Endereço"
                  className="w-full bg-lens-surface2 border border-lens-border2 rounded-md px-3 py-2 text-lens-text text-[0.82rem] outline-none focus:border-lens-accent"
                />
              </div>
            </div>
            <button 
              onClick={sendWhatsApp}
              className="w-full bg-[#25D366] text-white py-3 rounded-md font-bold text-[0.88rem] flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar Status via WhatsApp
            </button>
          </div>
        </div>

        <div className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-lens-border flex items-center gap-2.5 text-[0.72rem] font-bold tracking-widest uppercase text-lens-muted bg-lens-surface2">
            ◇ Perguntas para Entrevista
          </div>
          <div className="p-5">
            <ul className="flex flex-col gap-3 list-none" style={{ counterReset: 'q' }}>
              {r.questions.map((q, i) => (
                <li key={i} className="text-[0.85rem] leading-relaxed pl-6 relative text-[#c8c4bc]" style={{ counterIncrement: 'q' }}>
                  <span className="absolute left-0 font-mono text-lens-muted text-[0.7rem]">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-lens-border">
          <button 
            className="bg-transparent border border-lens-border2 text-lens-muted px-4 py-2 rounded-md text-[0.78rem] font-bold hover:border-lens-text hover:text-lens-text transition-colors flex items-center gap-2"
            onClick={() => onAddToCompare(r)}
          >
            <Plus size={14} /> Adicionar à comparação
          </button>
          <button 
            className="bg-transparent border border-lens-border2 text-lens-muted px-4 py-2 rounded-md text-[0.78rem] font-bold hover:border-lens-text hover:text-lens-text transition-colors flex items-center gap-2"
            onClick={exportPDF}
          >
            <Download size={14} /> Exportar PDF
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div className="flex-1 w-full">
          <label className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">Nome do candidato</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Mariana Silva"
            className="w-full bg-lens-surface border border-lens-border2 rounded-md px-3.5 py-2.5 text-lens-text font-syne text-[0.88rem] outline-none transition-colors focus:border-lens-accent placeholder:text-lens-muted"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">WhatsApp do Candidato</label>
          <input 
            type="text" 
            value={candidatePhone}
            onChange={e => setCandidatePhone(e.target.value)}
            placeholder="Ex: 5511999999999"
            className="w-full bg-lens-surface border border-lens-border2 rounded-md px-3.5 py-2.5 text-lens-text font-syne text-[0.88rem] outline-none transition-colors focus:border-lens-accent placeholder:text-lens-muted"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div className="flex-1 w-full">
          <label className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">Nome da Empresa</label>
          <input 
            type="text" 
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Ex: Google"
            className="w-full bg-lens-surface border border-lens-border2 rounded-md px-3.5 py-2.5 text-lens-text font-syne text-[0.88rem] outline-none transition-colors focus:border-lens-accent placeholder:text-lens-muted"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-[0.7rem] font-bold tracking-widest uppercase text-lens-muted mb-1.5 block">Cargo disputado</label>
          <input 
            type="text" 
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Ex: Gerente de Produto"
            className="w-full bg-lens-surface border border-lens-border2 rounded-md px-3.5 py-2.5 text-lens-text font-syne text-[0.88rem] outline-none transition-colors focus:border-lens-accent placeholder:text-lens-muted"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-lens-border flex items-center gap-3 bg-lens-surface2">
            <div className="w-5 h-5 rounded-full bg-lens-border2 text-lens-muted text-[0.65rem] font-mono flex items-center justify-center shrink-0">1</div>
            <span className="text-[0.72rem] font-bold tracking-widest uppercase text-lens-muted">Currículo — PDF</span>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div 
              className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors flex-1 flex flex-col items-center justify-center ${isDragging ? 'border-lens-accent bg-lens-accent/5' : 'border-lens-border2 hover:border-lens-accent hover:bg-lens-accent/5'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText size={32} className="mb-2.5 text-lens-muted" />
              <div className="text-[0.82rem] text-lens-muted leading-relaxed">
                Arraste o PDF aqui ou <strong className="text-lens-accent cursor-pointer">clique para selecionar</strong>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            
            {fileName && (
              <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-lens-accent2/10 border border-lens-accent2/20 rounded-full text-[0.75rem] font-mono text-lens-accent2 w-fit mx-auto">
                <CheckCircle2 size={14} />
                <span>{fileName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-lens-surface border border-lens-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-lens-border flex items-center gap-3 bg-lens-surface2">
            <div className="w-5 h-5 rounded-full bg-lens-border2 text-lens-muted text-[0.65rem] font-mono flex items-center justify-center shrink-0">2</div>
            <span className="text-[0.72rem] font-bold tracking-widest uppercase text-lens-muted">Descrição da Vaga</span>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <textarea 
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Cole a descrição completa da vaga — requisitos, responsabilidades, stack, soft skills, cultura esperada...&#10;&#10;Quanto mais detalhado, mais precisa será a análise."
              className="w-full h-full min-h-[180px] bg-transparent border-none text-lens-text font-syne text-[0.88rem] resize-none outline-none leading-relaxed placeholder:text-lens-muted"
            ></textarea>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-lens-danger/10 border border-lens-danger/25 rounded-md text-lens-danger text-[0.82rem] mb-4 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <button 
        className="w-full bg-lens-accent text-[#0d0d0f] py-4 px-8 rounded-md font-syne font-bold text-base flex items-center justify-center gap-2 tracking-wide transition-all hover:bg-[#f0d060] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(232,197,71,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        onClick={handleAnalyze}
        disabled={isLoading}
      >
        Analisar Candidato <ArrowRight size={18} />
      </button>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-lens-bg/90 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-6"
          >
            <div className="font-fraunces text-3xl font-black text-lens-accent">
              Analisando {name.trim() || 'Candidato'}...
            </div>
            <div className="w-[280px] h-0.5 bg-lens-border rounded-sm overflow-hidden">
              <motion.div 
                className="h-full bg-lens-accent rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="font-mono text-[0.75rem] text-lens-muted tracking-widest">
              {loadingStep}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NumberCounter({ from, to, duration }: { from: number, to: number, duration: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (to - from) * ease));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span>{count}</span>;
}
