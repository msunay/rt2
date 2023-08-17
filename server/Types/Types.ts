export interface User {
  id?: string;
  email: string;
  username: string;
  password: string;
  isPremiumMember: boolean;
  pointsWon: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quiz {
  id?: string;
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Question {
  id?: string;
  questionText: string;
  createdAt?: Date;
  updatedAt?: Date;
  QuizId?: string;
}

export interface Answer {
  id?: string;
  answerText: string;
  isCorrect: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  QuestionId?: string;
}

export interface Participation {
  id?: string;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  UserId?: string;
  QuizId?: string;
}
