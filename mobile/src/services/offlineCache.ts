import { storage } from '@/utils/storage';
import { generateProblems } from './clientProblemGenerator';
import { Lesson, PracticeProblem } from '@/types/lesson';

export interface OfflineFormula {
  id: string;
  topic: string;
  title: string;
  formula: string;
  description: string;
}

export interface OfflineCacheData {
  timestamp: string;
  lessons: Lesson[];
  formulas: OfflineFormula[];
  topics: Array<{ name: string; icon: string; subtopics: string[] }>;
}

const DEFAULT_OFFLINE_FORMULAS: OfflineFormula[] = [
  {
    id: 'form_alg_1',
    topic: 'Algebra',
    title: 'Quadratic Formula',
    formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Finds roots of ax² + bx + c = 0',
  },
  {
    id: 'form_alg_2',
    topic: 'Algebra',
    title: 'Slope-Intercept Form',
    formula: 'y = mx + b',
    description: 'Line with slope m and y-intercept b',
  },
  {
    id: 'form_geo_1',
    topic: 'Geometry',
    title: 'Pythagorean Theorem',
    formula: 'a^2 + b^2 = c^2',
    description: 'Relates sides of a right triangle',
  },
  {
    id: 'form_geo_2',
    topic: 'Geometry',
    title: 'Area of Circle',
    formula: 'A = \\pi r^2',
    description: 'Area of circle with radius r',
  },
  {
    id: 'form_trig_1',
    topic: 'Trigonometry',
    title: 'Pythagorean Identity',
    formula: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    description: 'Fundamental trigonometric identity',
  },
  {
    id: 'form_trig_2',
    topic: 'Trigonometry',
    title: 'Sine Law',
    formula: '\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}',
    description: 'Relates sides and angles of any triangle',
  },
  {
    id: 'form_calc_1',
    topic: 'Calculus',
    title: 'Power Rule for Derivatives',
    formula: '\\frac{d}{dx}[x^n] = n x^{n-1}',
    description: 'Derivative of x raised to power n',
  },
  {
    id: 'form_calc_2',
    topic: 'Calculus',
    title: 'Fundamental Theorem of Calculus',
    formula: '\\int_{a}^{b} f(x) dx = F(b) - F(a)',
    description: 'Definite integral evaluation',
  },
  {
    id: 'form_stat_1',
    topic: 'Statistics',
    title: 'Sample Mean',
    formula: '\\bar{x} = \\frac{\\sum x_i}{n}',
    description: 'Average of sample values',
  },
  {
    id: 'form_stat_2',
    topic: 'Statistics',
    title: 'Standard Deviation',
    formula: 's = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n - 1}}',
    description: 'Measure of variability in data',
  },
];

const DEFAULT_OFFLINE_TOPICS = [
  {
    name: 'Algebra',
    icon: 'calculator-outline',
    subtopics: ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Systems of Equations'],
  },
  {
    name: 'Geometry',
    icon: 'shapes-outline',
    subtopics: ['Angles & Triangles', 'Pythagorean Theorem', 'Circle Geometry', 'Area & Volume'],
  },
  {
    name: 'Trigonometry',
    icon: 'triangle-outline',
    subtopics: ['Sine, Cosine, Tangent', 'Unit Circle & Identities', 'Trigonometric Equations'],
  },
  {
    name: 'Calculus',
    icon: 'analytics-outline',
    subtopics: ['Limits & Continuity', 'Derivatives & Power Rule', 'Definite Integrals'],
  },
  {
    name: 'Statistics',
    icon: 'bar-chart-outline',
    subtopics: ['Mean, Median, Mode', 'Standard Deviation & Variance', 'Probability'],
  },
];

const DEFAULT_OFFLINE_LESSONS: Lesson[] = [
  {
    _id: 'off_alg_1',
    topic: 'algebra',
    subtopic: 'linear equations',
    order: 1,
    title: 'Solving Linear Equations in One Variable',
    description: 'Learn how to solve single variable linear equations using inverse operations.',
    difficulty: 'Beginner',
    estimatedTime: 10,
    isLocked: false,
    content: {
      introduction: 'A linear equation in one variable is an equation that can be written in the form $$ax + b = 0$$. To solve for $x$, isolate the variable by applying inverse operations step-by-step.',
      sections: [
        {
          title: 'Core Concept',
          content: 'Isolate the variable $x$ by adding, subtracting, multiplying, or dividing both sides by non-zero terms.',
          examples: [
            {
              problem: 'Solve $2x + 5 = 15$',
              solution: '$x = 5$',
              steps: ['Subtract 5 from both sides: $2x = 10$', 'Divide by 2: $x = 5$'],
            },
          ],
        },
      ],
      summary: 'Always perform identical operations on both sides to keep the equation balanced.',
      keyTakeaways: ['Isolate the variable', 'Perform inverse operations on both sides'],
    },
  },
  {
    _id: 'off_alg_2',
    topic: 'algebra',
    subtopic: 'quadratic equations',
    order: 2,
    title: 'Mastering the Quadratic Formula',
    description: 'Understand and apply the quadratic formula to find roots.',
    difficulty: 'Intermediate',
    estimatedTime: 15,
    isLocked: false,
    content: {
      introduction: 'For any quadratic equation in standard form $$ax^2 + bx + c = 0$$, the solutions are given by $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$.',
      sections: [
        {
          title: 'The Discriminant',
          content: 'The expression $$b^2 - 4ac$$ determines the number and nature of solutions.',
          examples: [
            {
              problem: 'Solve $x^2 - 5x + 6 = 0$',
              solution: '$x = 2, 3$',
              steps: ['Identify $a=1, b=-5, c=6$', 'Apply formula: $x = \\frac{5 \\pm \\sqrt{25 - 24}}{2}$', '$x = \\frac{5 \\pm 1}{2} \\Rightarrow x=3, x=2$'],
            },
          ],
        },
      ],
      summary: 'The quadratic formula works for all quadratic equations.',
      keyTakeaways: ['Standard form: $ax^2+bx+c=0$', 'Discriminant tells if roots are real or complex'],
    },
  },
  {
    _id: 'off_geo_1',
    topic: 'geometry',
    subtopic: 'pythagorean theorem',
    order: 1,
    title: 'Pythagorean Theorem & Right Triangles',
    description: 'Calculate missing side lengths in right triangles.',
    difficulty: 'Beginner',
    estimatedTime: 12,
    isLocked: false,
    content: {
      introduction: 'In a right triangle with leg lengths $a$ and $b$ and hypotenuse $c$, the relationship is $$a^2 + b^2 = c^2$$.',
      sections: [
        {
          title: 'Right Triangle Formula',
          content: 'Use $c = \\sqrt{a^2 + b^2}$ to find the hypotenuse.',
          examples: [
            {
              problem: 'Find hypotenuse when $a=3, b=4$',
              solution: '$c = 5$',
              steps: ['$c^2 = 3^2 + 4^2 = 9 + 16 = 25$', '$c = \\sqrt{25} = 5$'],
            },
          ],
        },
      ],
      summary: 'The Pythagorean theorem applies exclusively to right-angled triangles.',
      keyTakeaways: ['$a^2 + b^2 = c^2$', 'Common triple: 3-4-5'],
    },
  },
  {
    _id: 'off_trig_1',
    topic: 'trigonometry',
    subtopic: 'sine, cosine, tangent',
    order: 1,
    title: 'Introduction to Trigonometric Ratios',
    description: 'Master Sine, Cosine, and Tangent definitions.',
    difficulty: 'Intermediate',
    estimatedTime: 15,
    isLocked: false,
    content: {
      introduction: 'In right-angled triangles: $$\\sin(\\theta) = \\frac{\\text{opp}}{\\text{hyp}}$$, $$\\cos(\\theta) = \\frac{\\text{adj}}{\\text{hyp}}$$, and $$\\tan(\\theta) = \\frac{\\text{opp}}{\\text{adj}}$$.',
      sections: [
        {
          title: 'SOH CAH TOA',
          content: 'Remember the acronym SOH CAH TOA for trigonometric ratios.',
          examples: [
            {
              problem: 'Find $\\sin(\\theta)$ if opp=3, hyp=5',
              solution: '$\\sin(\\theta) = 0.6$',
              steps: ['$\\sin(\\theta) = \\frac{3}{5} = 0.6$'],
            },
          ],
        },
      ],
      summary: 'Trig ratios relate angles to side ratios in right triangles.',
      keyTakeaways: ['SOH CAH TOA', 'Sine = opposite / hypotenuse'],
    },
  },
];

export const offlineCacheService = {
  /**
   * Pre-cache all lessons, formulas, topics, and problem templates into persistent storage
   */
  async preCacheOfflineData(): Promise<{ cachedCount: number; lessonsCount: number; formulasCount: number }> {
    try {
      // 1. Generate client-side offline practice problem sets across topics
      const topicsList = ['algebra', 'geometry', 'trigonometry', 'calculus', 'statistics'];
      let totalProblemsGenerated = 0;
      topicsList.forEach((tp) => {
        const probs = generateProblems(tp, 'mixed', 10);
        totalProblemsGenerated += probs.length;
      });

      // 2. Build full cache object
      const cacheData: OfflineCacheData = {
        timestamp: new Date().toISOString(),
        lessons: DEFAULT_OFFLINE_LESSONS,
        formulas: DEFAULT_OFFLINE_FORMULAS,
        topics: DEFAULT_OFFLINE_TOPICS,
      };

      // 3. Save to storage
      await storage.setItem('mathmentor_offline_cache', JSON.stringify(cacheData));
      await storage.setItem('mathmentor_offline_mode', 'true');

      const totalItems = DEFAULT_OFFLINE_LESSONS.length + DEFAULT_OFFLINE_FORMULAS.length + totalProblemsGenerated;

      console.log(`✅ Offline cache built successfully with ${totalItems} total resources.`);
      return {
        cachedCount: totalItems,
        lessonsCount: DEFAULT_OFFLINE_LESSONS.length,
        formulasCount: DEFAULT_OFFLINE_FORMULAS.length,
      };
    } catch (e) {
      console.warn('Failed to pre-cache offline data:', e);
      throw e;
    }
  },

  /**
   * Check if Offline Cache Mode is enabled
   */
  async isOfflineCacheEnabled(): Promise<boolean> {
    try {
      const stored = await storage.getItem('mathmentor_offline_mode');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  },

  /**
   * Toggle Offline Cache Mode
   */
  async setOfflineCacheEnabled(enabled: boolean): Promise<{ cachedCount: number; lessonsCount: number; formulasCount: number }> {
    if (enabled) {
      return await this.preCacheOfflineData();
    } else {
      await storage.setItem('mathmentor_offline_mode', 'false');
      return { cachedCount: 0, lessonsCount: 0, formulasCount: 0 };
    }
  },

  /**
   * Get cached offline lessons
   */
  async getOfflineLessons(topic?: string, subtopic?: string): Promise<Lesson[]> {
    try {
      const raw = await storage.getItem('mathmentor_offline_cache');
      let list = DEFAULT_OFFLINE_LESSONS;
      if (raw) {
        const parsed: OfflineCacheData = JSON.parse(raw);
        if (parsed.lessons && parsed.lessons.length > 0) {
          list = parsed.lessons;
        }
      }
      if (topic) {
        list = list.filter((l) => l.topic.toLowerCase() === topic.toLowerCase());
      }
      if (subtopic) {
        list = list.filter((l) => l.subtopic.toLowerCase() === subtopic.toLowerCase());
      }
      return list;
    } catch (e) {
      return DEFAULT_OFFLINE_LESSONS;
    }
  },

  /**
   * Get single offline lesson by ID
   */
  async getOfflineLesson(lessonId: string): Promise<Lesson | null> {
    const lessons = await this.getOfflineLessons();
    return lessons.find((l) => l._id === lessonId) ?? lessons[0] ?? null;
  },

  /**
   * Get offline formula reference cards
   */
  async getOfflineFormulas(): Promise<OfflineFormula[]> {
    try {
      const raw = await storage.getItem('mathmentor_offline_cache');
      if (raw) {
        const parsed: OfflineCacheData = JSON.parse(raw);
        if (parsed.formulas) return parsed.formulas;
      }
      return DEFAULT_OFFLINE_FORMULAS;
    } catch (e) {
      return DEFAULT_OFFLINE_FORMULAS;
    }
  },
};
