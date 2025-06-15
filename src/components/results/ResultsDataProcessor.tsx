
export interface GradeInfo {
  grade: string;
  color: string;
  description: string;
}

export const getGrade = (percentage: number): GradeInfo => {
  if (percentage >= 85) return { grade: 'A+', color: 'text-green-600', description: 'Excellent' };
  if (percentage >= 75) return { grade: 'A', color: 'text-green-500', description: 'Very Good' };
  if (percentage >= 65) return { grade: 'B+', color: 'text-blue-500', description: 'Good' };
  if (percentage >= 55) return { grade: 'B', color: 'text-blue-400', description: 'Above Average' };
  if (percentage >= 45) return { grade: 'C', color: 'text-yellow-500', description: 'Average' };
  return { grade: 'F', color: 'text-red-500', description: 'Below Average' };
};

export const formatTimeSpent = (timeSpent: number): string => {
  return `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;
};

export const generateQuestionTimeData = (questions: any[], answers: Record<number, string>) => {
  return Array.from({ length: questions.length }, (_, index) => {
    const questionNum = index + 1;
    const isAnswered = answers[questionNum];
    // Simulate realistic time spent based on whether question was answered
    const baseTime = isAnswered ? Math.floor(Math.random() * 120) + 30 : 0; // 30-150s for answered, 0 for unanswered
    return {
      questionNumber: questionNum,
      timeSpent: baseTime
    };
  });
};
