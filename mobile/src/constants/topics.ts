export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'algebra',
    name: 'Algebra',
    icon: 'calculator',
    color: '#2563eb',
  },
  {
    id: 'geometry',
    name: 'Geometry',
    icon: 'shape',
    color: '#10b981',
  },
  {
    id: 'trigonometry',
    name: 'Trigonometry',
    icon: 'analytics',
    color: '#f59e0b',
  },
];

export const GRADE_LEVELS = [9, 10, 11, 12];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
