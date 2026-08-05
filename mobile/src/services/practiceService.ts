/**
 * Practice Problems Service
 * Handles fetching randomly generated practice problems from the backend
 */

import api from './api';

export interface PracticeProblem {
  id: string;
  topic: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  solution: string;
}

export interface PracticeCategory {
  id: string;
  name: string;
  categories: string[];
}

export interface CategoryDescriptions {
  basic: string;
  intermediate: string;
  advanced: string;
  mixed: string;
}

export interface PracticeProblemsResponse {
  topic: string;
  category: string;
  count: number;
  problems: PracticeProblem[];
}

export interface CategoriesResponse {
  topics: PracticeCategory[];
  categoryDescriptions: CategoryDescriptions;
}

/**
 * Get available practice topics and categories
 */
export const getPracticeCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await api.get('/practice/categories');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching practice categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch practice categories');
  }
};

/**
 * Generate practice problems
 * @param topic - algebra, geometry, or trigonometry
 * @param category - basic, intermediate, advanced, or mixed (default: mixed)
 * @param count - number of problems to generate (1-30, default: 5)
 */
export const getPracticeProblems = async (
  topic: string,
  category: string = 'mixed',
  count: number = 5
): Promise<PracticeProblemsResponse> => {
  try {
    const response = await api.get('/practice/problems', {
      params: { topic, category, count }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching practice problems:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch practice problems');
  }
};

/**
 * Get basic problems for a specific topic
 */
export const getBasicProblems = async (topic: string, count: number = 5) => {
  return getPracticeProblems(topic, 'basic', count);
};

/**
 * Get intermediate problems for a specific topic
 */
export const getIntermediateProblems = async (topic: string, count: number = 5) => {
  return getPracticeProblems(topic, 'intermediate', count);
};

/**
 * Get advanced problems for a specific topic
 */
export const getAdvancedProblems = async (topic: string, count: number = 5) => {
  return getPracticeProblems(topic, 'advanced', count);
};

/**
 * Get mixed review problems for a specific topic
 */
export const getMixedProblems = async (topic: string, count: number = 15) => {
  return getPracticeProblems(topic, 'mixed', count);
};

export default {
  getPracticeCategories,
  getPracticeProblems,
  getBasicProblems,
  getIntermediateProblems,
  getAdvancedProblems,
  getMixedProblems
};
