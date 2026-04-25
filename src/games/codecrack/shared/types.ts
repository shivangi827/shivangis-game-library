export type QuestionType = 'pattern' | 'bigO' | 'output' | 'bugspot';

export type Topic =
  | 'arrays-hashing'
  | 'two-pointers'
  | 'sliding-window'
  | 'stacks-queues'
  | 'binary-search'
  | 'trees-graphs'
  | 'dynamic-programming'
  | 'recursion-backtracking';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  type: QuestionType;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const TYPE_LABELS: Record<QuestionType, string> = {
  pattern: 'Pattern Match',
  bigO: 'Big O',
  output: 'Output',
  bugspot: 'Bug Spot',
};

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 200,
  hard: 300,
};
