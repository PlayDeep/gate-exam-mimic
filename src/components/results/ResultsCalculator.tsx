
import { useMemo } from 'react';

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
  
  const results = useMemo(() => {
    console.log('=== RESULTS CALCULATOR START ===');
    console.log('Input questions:', questions.length);
    console.log('Input answers:', Object.keys(answers || {}).length);
    console.log('Passed score:', passedScore);
    console.log('Passed percentage:', passedPercentage);
    
    // Enhanced input validation
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
    let calculatedScore = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    const subjectWiseAnalysis: Record<string, any> = {};

    // Calculate max possible score
    const maxScore = questions.reduce((sum: number, q: any) => {
      const marks = typeof q.marks === 'number' ? q.marks : 1;
      return sum + marks;
    }, 0);

    console.log('Max possible score:', maxScore);

    // Process each question with enhanced logic
    questions.forEach((question: any, index: number) => {
      const questionNum = index + 1;
      const userAnswer = answersObj[questionNum];
      
      // Normalize answers for comparison - consistent with submission logic
      const normalizedUserAnswer = userAnswer !== undefined && userAnswer !== '' ? String(userAnswer).trim() : '';
      const normalizedCorrectAnswer = String(question.correct_answer || '').trim();
      
      // Get question properties with enhanced defaults
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
        console.log(`Q${questionNum}: Unanswered`);
      } else {
        // Check if answer is correct
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (isCorrect) {
          // Correct answer
          correctAnswers++;
          subjectWiseAnalysis[subject].correct++;
          subjectWiseAnalysis[subject].score += marks;
          
          // Add to calculated score only if we're not using passed score
          if (passedScore === undefined) {
            calculatedScore += marks;
          }
          
          console.log(`Q${questionNum}: Correct (${marks} marks)`);
        } else {
          // Wrong answer
          wrongAnswers++;
          subjectWiseAnalysis[subject].wrong++;
          
          // Apply negative marking only for MCQ questions
          if (question.question_type === 'MCQ') {
            subjectWiseAnalysis[subject].score -= negativeMarks;
            
            // Subtract from calculated score only if we're not using passed score
            if (passedScore === undefined) {
              calculatedScore -= negativeMarks;
            }
          }
          
          console.log(`Q${questionNum}: Wrong (${question.question_type === 'MCQ' ? -negativeMarks : 0} marks)`);
        }
      }
    });

    // Use passed score if available, otherwise use calculated score
    let finalScore = passedScore !== undefined ? passedScore : calculatedScore;
    
    // Ensure score doesn't go below 0 and round properly
    finalScore = Math.max(0, Math.round(finalScore * 100) / 100);

    // Round subject-wise scores
    Object.values(subjectWiseAnalysis).forEach((analysis: any) => {
      analysis.score = Math.max(0, Math.round(analysis.score * 100) / 100);
    });

    const result = {
      score: finalScore,
      correctAnswers,
      wrongAnswers,
      unanswered,
      totalQuestions: questions.length,
      maxScore,
      subjectWiseAnalysis
    };

    console.log('=== RESULTS CALCULATOR END ===');
    console.log('Final result:', result);

    return result;
  }, [questions, answers, passedScore, passedPercentage]);

  return results;
};
