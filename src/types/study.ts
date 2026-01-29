export type ContentBlockType =
  | 'paragraph' | 'h2' | 'h3' | 'list'
  | 'box-goal' | 'box-insight' | 'box-warning' | 'box-action' | 'pillar-end'
  | 'video' | 'table' | 'dialogue'
  | 'system-status' | 'terminal-view' | 'interactive-quiz' | 'reveal-box'
  | 'comparison' | 'audio-player' | 'cards-grid' | 'decision-tree'
  // Interactive types for Pilar 1
  | 'brain-diagram' | 'comparison-table' | 'scenario-card' | 'phonetic-breakdown' | 'elite-insight'
  // New types for Part 2
  | 'memory-diagram' | 'baby-learning' | 'phrase-analysis';

export interface ContentBlock {
  type: ContentBlockType;
  content: string | string[]; // string for text, string[] for lists
  title?: string; // For boxes or custom headers
}

export interface PillarModule {
  id: string;
  title: string;
  subtitle?: string;
  blocks: ContentBlock[];
  status?: 'locked' | 'active' | 'completed';
}

export interface PillarData {
  id: number;
  title: string;
  subtitle: string;
  blocks?: ContentBlock[]; // Keeping for backward compatibility or intro text
  modules?: PillarModule[]; // The new cascading structure
}
