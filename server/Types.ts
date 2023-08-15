export interface User {
  userId?: string;
  email: string;
  username: string;
  password: string;
  isPremiumMember: boolean;
  pointsWon: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quiz {
  quizId?: string;
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Question {
  questionId?: string;
  questionText: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Answer {
  answerId?: string;
  answerText: string;
  isCorrect: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
