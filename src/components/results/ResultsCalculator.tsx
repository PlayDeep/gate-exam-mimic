
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
  
  const calculateResults = (): ResultsData => {
    // Validate inputs
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('Invalid questions data:', questions);
      return {
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        unanswered: 0,
        totalQuestions: 0,
        maxScore: 0,
        subjectWiseAnalysis: {}
      };
    }

    const answersObj = answers || {};
    let score = passedScore !== undefined ? passedScore : 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    const subjectWiseAnalysis: Record<string, any> = {};

    // Calculate max possible score
    const maxScore = questions.reduce((sum: number, q: any) => {
      const marks = typeof q.marks === 'number' ? q.marks : 1;
      return sum + marks;
    }, 0);

    // Process each question
    questions.forEach((question: any, index: number) => {
      const questionNum = index + 1;
      const userAnswer = answersObj[questionNum];
      
      // Normalize answers for comparison
      const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
      const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer || '').trim();
      const isCorrect = normalizedUserAnswer && normalizedUserAnswer === normalizedCorrectAnswer;
      
      // Get question properties with defaults
      const marks = typeof question.marks === 'number' ? question.marks : 1;
      const negativeMarks = typeof question.negative_marks === 'number' ? question.negative_marks : 
                           (question.question_type === 'MCQ' ? (marks === 1 ? 1/3 : 2/3) : 0);
      const subject = question.subject || 'Unknown';

      // Initialize subject analysis if not exists
      if (!subjectWiseAnalysis[subject]) {
        subjectWiseAnalysis[subject] = {
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          score: 0
        };
      }
      
      subjectWiseAnalysis[subject].total++;

      if (!normalizedUserAnswer) {
        // Unanswered question
        unanswered++;
        subjectWiseAnalysis[subject].unanswered++;
      } else if (isCorrect) {
        // Correct answer
        correctAnswers++;
        subjectWiseAnalysis[subject].correct++;
        subjectWiseAnalysis[subject].score += marks;
        
        // Add to total score only if we're calculating it (not using passed score)
        if (passedScore === undefined) {
          score += marks;
        }
      } else {
        // Wrong answer
        wrongAnswers++;
        subjectWiseAnalysis[subject].wrong++;
        
        // Apply negative marking only for MCQ questions
        if (question.question_type === 'MCQ') {
          subjectWiseAnalysis[subject].score -= negativeMarks;
          
          // Subtract from total score only if we're calculating it (not using passed score)
          if (passedScore === undefined) {
            score -= negativeMarks;
          }
        }
      }
    });

    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    // Round score to 2 decimal places
    score = Math.round(score * 100) / 100;

    // Round subject-wise scores
    Object.values(subjectWiseAnalysis).forEach((analysis: any) => {
      analysis.score = Math.round(analysis.score * 100) / 100;
    });

    console.log('Results calculation:', {
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers,
      unanswered,
      calculatedScore: score,
      passedScore,
      maxScore
    });

    return {
      score,
      correctAnswers,
      wrongAnswers,
      unanswered,
      totalQuestions: questions.length,
      maxScore,
      subjectWiseAnalysis
    };
  };

  return calculateResults();
};
