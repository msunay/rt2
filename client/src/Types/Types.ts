// Database model types

import { NumberLiteralType } from 'typescript';

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

export interface UserAuth {
  id?: string;
  email: string;
  username: string;
  password: string;
  isPremiumMember: boolean;
  pointsWon: number;
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
}

export interface Quiz {
  id?: string;
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
  host_name?: string;
}

export interface Question {
  id?: string;
  questionText: string;
  positionInQuiz: number;
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

// Reference table types

export interface Participation {
  id?: string;
  isPaid: boolean;
  UserId?: string;
  QuizId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParticipationAnswer {
  id?: string;
  ParticipationId: string;
  AnswerId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Compound data structure types

export interface QuestionAnswer {
  id: string;
  questionText: string;
  positionInQuiz: number;
  createdAt: Date;
  updatedAt: Date;
  QuizId?: string;
  Answers: {
    id: string;
    answerText: string;
    isCorrect: boolean;
    createdAt: Date;
    updatedAt: Date;
    QuestionId: string;
  }[];
}

export interface UserParticipations {
  id: string;
  email: string;
  password: string;
  isPremiumMember: boolean;
  pointsWon: number;
  createdAt: Date;
  updatedAt: Date;
  quizzes: Quiz[];
}

export interface QuizParticipations {
  id: string;
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: string;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
}

export interface QuizQuestionAnswer {
  id: string;
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: Date;
  createdAt: Date;
  updatedAt: Date;
  Questions: {
    id: string;
    questionText: string;
    positionInQuiz: number;
    createdAt: Date;
    updatedAt: Date;
    QuizId?: string;
    Answers: {
      id: string;
      answerText: string;
      isCorrect: boolean;
      createdAt: Date;
      updatedAt: Date;
      QuestionId: string;
    }[];
  }[];
}

export interface ParticipationAndAnswers {
  id: string;
  isPaid: boolean;
  UserId: string;
  QuizId: string;
  createdAt: Date;
  updatedAt: Date;
  answers: {
    id: string;
    answerText: string;
    isCorrect: boolean;
    createdAt: Date;
    updatedAt: Date;
    QuestionId: string;
    ParticipationAnswer: {
      id: string;
      ParticipationId: string;
      AnswerId: string;
      createdAt: string;
      updatedAt: string;
    };
  }[];
}

// Authentication types

export interface ResponseUser {
  dataValues: User;
  token: string;
}

export interface UserPost {
  email: string;
  username: string;
  password: string;
}
