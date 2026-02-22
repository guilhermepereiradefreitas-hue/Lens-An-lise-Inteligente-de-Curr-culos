export interface Subscore {
  label: string;
  value: number;
}

export interface Blindspot {
  label: string;
  text: string;
}

export interface AnalysisResult {
  id: number;
  name: string;
  role: string;
  date: string;
  score: number;
  verdict: "GO" | "MAYBE" | "NO";
  title: string;
  summary: string;
  subscores: Subscore[];
  strengths: string[];
  gaps: string[];
  blindspots: Blindspot[];
  questions: string[];
}
