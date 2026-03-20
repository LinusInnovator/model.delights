export type IntentLevel = 'technical' | 'executive' | 'beginner';

export interface EvidenceBlock {
  id: string;
  type: 'benchmark' | 'screenshot' | 'quote' | 'methodology' | 'definition' | 'security';
  content: string;
  sourceLabel: string;
}

export interface ChartData {
  title: string;
  description: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface BenchmarkData {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface NarrativeBlock {
  id: string;
  type: 'p' | 'h2' | 'h3' | 'callout' | 'quote';
  // Allow multiple intents for dynamic tone shifting
  content: Record<IntentLevel, string | string[]>;
  evidenceId?: string; // Links this paragraph directly to an evidence block required by E-E-A-T
}

export interface ContentObject {
  id: string;
  slug: string;
  topicEntity: string;           
  lastVerifiedDate: string;      
  datePublished: string;
  readTimeMin: number;
  
  author: {
    name: string;
    credentials: string; 
    methodologyUrl?: string;     
  };
  
  // High-level extraction layer
  primaryAnswer: {
    question: string;            
    summary: string;             
  };
  
  extractableAssets: {
    comparisonTable?: BenchmarkData;
    proprietaryChart?: ChartData; 
    expertQuote?: { text: string; author: string };        
  };

  evidenceLog: Record<string, EvidenceBlock>;  
  limitations: string[];         
  
  title: Record<IntentLevel, string>;
  subtitle: Record<IntentLevel, string>;
  heroImage?: {
    url: string;
    alt: string;
  };

  narrativeBlocks: NarrativeBlock[]; 
}
