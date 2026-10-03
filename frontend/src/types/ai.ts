export interface AIClipRecommendation {
  id: string;
  start_time: number;
  end_time: number;
  title: string;
  reason: string;
  hook: string;
  caption: string;
  confidence: number;
}

export interface AIAnalysisResult {
  analysis_status: string;
  summary: string;
  clips: AIClipRecommendation[];
}
