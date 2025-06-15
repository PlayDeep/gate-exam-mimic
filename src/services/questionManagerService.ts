// Re-export all functions from the specialized services
export { fetchQuestions, submitQuestion } from './questionCrudService';
export { deleteQuestion, deleteAllQuestions } from './questionDeletionService';
export { addSampleImageQuestion } from './sampleDataService';

// Keep the types export for backward compatibility
export type { Question, FormData } from '@/types/question';
