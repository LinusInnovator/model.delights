export type ToneLevel = 'simple' | 'professional' | 'academic';

export interface MarginNote {
  id: string;
  content: string;
  authorTitle?: string;
}

export interface ContentBlock {
  id: string;
  type: 'p' | 'h2' | 'h3' | 'quote' | 'list' | 'callout';
  // The content itself changes based on the tone
  content: Record<ToneLevel, string | string[]>; 
  marginNoteId?: string; // Links this block to a specific side-note
}

export interface ManifestoArticle {
  slug: string;
  partNumber: number;
  title: Record<ToneLevel, string>;
  subtitle: Record<ToneLevel, string>;
  date: string;
  readTimeMin: number;
  heroImage?: {
    url: string;
    alt: string;
  };
  blocks: ContentBlock[];
  marginNotes: Record<string, MarginNote>;
}
