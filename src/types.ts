export interface KeyElement {
  name: string;
  description: string;
}

export interface PromptAnalysisResult {
  title: string;
  detailedPromptEn: string;
  detailedPromptAr: string;
  shortPromptEn: string;
  shortPromptAr: string;
  negativePromptEn: string;
  negativePromptAr: string;
  aspectRatio: string;
  styleTags: string[];
  keyElements: KeyElement[];
  midjourneyCommand: string;
  fluxPrompt: string;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  imageUrl: string;
  data: PromptAnalysisResult;
}

export type PromptMode = 'detailed' | 'short' | 'commands';
