
// Re-export all functionality from the refactored service files
export type { TestSession } from './testSessionService';
export { 
  createTestSession, 
  submitTestSession, 
  checkIfTestSubmitted, 
  deleteTestSession 
} from './testSessionService';
export { saveUserAnswer } from './userAnswerService';
export { 
  getUserTests, 
  getUserTestSessions, 
  getTestSessionDetails 
} from './testDetailsService';
