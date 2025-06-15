
export interface ResultsData {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalQuestions: number;
  maxScore: number;
  subjectWiseAnalysis: Record<string, any>;
}

interface ResultsCalculatorProps {
  questions: any[];
  answers: Record<number, string>;
  passedScore?: number;
  passedPercentage?: number;
}

export const useResultsCalculator = ({ 
  questions, 
  answers, 
  passedScore, 
  passedPercentage 
}: ResultsCalculatorProps): ResultsData => {
  const usePassedScore = passedScore !== undefined && passedPercentage !== undefined;

  const calculateResults = (): ResultsData => {
    if (usePassedScore) {
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unanswered = 0;
      const subjectWiseAnalysis: Record<string, any> = {};

      questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
        const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            score: 0
          };
        }
        
        subjectWiseAnalysis[question.subject].total++;

        if (!userAnswer) {
          unanswered++;
          subjectWiseAnalysis[question.subject].unanswered++;
        } else if (isCorrect) {
          correctAnswers++;
          subjectWiseAnalysis[question.subject].correct++;
          subjectWiseAnalysis[question.subject].score += question.marks;
        } else {
          wrongAnswers++;
          subjectWiseAnalysis[question.subject].wrong++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (question.marks === 1 ? 1/3 : 2/3);
            subjectWiseAnalysis[question.subject].score -= negativeMarks;
          }
        }
      });

      return {
        score: passedScore,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions: questions.length,
        maxScore: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        subjectWiseAnalysis
      };
    } else {
      let score = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unanswered = 0;
      const subjectWiseAnalysis: Record<string, any> = {};

      questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
        const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            score: 0
          };
        }
        
        subjectWiseAnalysis[question.subject].total++;

        if (!userAnswer) {
          unanswered++;
          subjectWiseAnalysis[question.subject].unanswered++;
        } else if (isCorrect) {
          correctAnswers++;
          score += question.marks;
          subjectWiseAnalysis[question.subject].correct++;
          subjectWiseAnalysis[question.subject].score += question.marks;
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (question.marks === 1 ? 1/3 : 2/3);
            score -= negativeMarks;
            subjectWiseAnalysis[question.subject].score -= negativeMarks;
          }
          subjectWiseAnalysis[question.subject].wrong++;
        }
      });

      return {
        score: Math.round(score * 100) / 100,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions: questions.length,
        maxScore: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        subjectWiseAnalysis
      };
    }
  };

  return calculateResults();
};
