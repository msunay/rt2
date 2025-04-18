import { Quiz, Participation, Question, Answer } from '@/types/Types';

/**
 * Transforms raw API data into component-friendly format
 */
export interface QuizViewData {
  id: string;
  title: string;
  description: string;
  questions: QuestionViewData[];
  hasStarted: boolean;
  isCompleted: boolean;
}

export interface QuestionViewData {
  id: string;
  text: string;
  order: number;
  answers: AnswerViewData[];
  timeLimit: number;
}

export interface AnswerViewData {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ParticipationViewData {
  id: string;
  username: string;
  score: number;
  quizId: string;
  answers: Array<{
    questionId: string;
    answerId: string;
    isCorrect: boolean;
  }>;
}

/**
 * Transforms Quiz API data into view data
 */
export function transformQuizData(quiz: Quiz | undefined): QuizViewData | null {
  if (!quiz) return null;
  
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description || '',
    questions: (quiz.questions || []).map(transformQuestionData),
    hasStarted: !!quiz.hasStarted,
    isCompleted: !!quiz.isCompleted
  };
}

/**
 * Transforms Question API data into view data
 */
export function transformQuestionData(question: Question): QuestionViewData {
  return {
    id: question.id,
    text: question.text,
    order: question.order,
    answers: (question.answers || []).map(transformAnswerData),
    timeLimit: question.timeLimit || 10
  };
}

/**
 * Transforms Answer API data into view data
 */
export function transformAnswerData(answer: Answer): AnswerViewData {
  return {
    id: answer.id,
    text: answer.text,
    isCorrect: !!answer.isCorrect
  };
}

/**
 * Transforms Participation API data into view data
 */
export function transformParticipationData(
  participation: Participation | undefined
): ParticipationViewData | null {
  if (!participation) return null;
  
  return {
    id: participation.id,
    username: participation.username,
    score: participation.score || 0,
    quizId: participation.QuizId,
    answers: (participation.QuizParticipationAnswers || []).map(pa => ({
      questionId: pa.QuestionId,
      answerId: pa.AnswerId,
      isCorrect: !!pa.isCorrect
    }))
  };
}

/**
 * Returns the current question based on question number
 */
export function getCurrentQuestion(
  quiz: QuizViewData | null, 
  questionNumber: number
): QuestionViewData | null {
  if (!quiz) return null;
  
  // Find the question with the matching order
  return quiz.questions.find(q => q.order === questionNumber) || null;
}