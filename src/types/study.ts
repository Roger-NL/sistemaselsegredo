export type ContentBlockType = 'paragraph' | 'h2' | 'h3' | 'list' | 'box-goal' | 'box-insight' | 'box-warning' | 'box-action' | 'pillar-end';

export interface ContentBlock {
  type: ContentBlockType;
  content: string | string[]; // string for text, string[] for lists
  title?: string; // For boxes or custom headers
}

export interface PillarData {
  id: number;
  title: string;
  subtitle: string;
  blocks: ContentBlock[];
}
