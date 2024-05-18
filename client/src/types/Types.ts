// Database model types

import type { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta, QueryActionCreatorResult, QueryDefinition } from "@reduxjs/toolkit/query";

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
  hasVideo: boolean;
  isPrivate: boolean;
  pin?: number;
  createdAt?: Date;
  updatedAt?: Date;
  host_name?: string;
  [key: string]: string | Date | boolean | number | undefined;
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
  answerNumber: number;
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

export interface Winner {
  username: string;
  userScore: number;
}

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
    answerNumber: number;
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
      answerNumber: number;
      createdAt: Date;
      updatedAt: Date;
      QuestionId: string;
    }[];
  }[];
}
export interface FullQuizState {
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: string;
  isPrivate: boolean;
  pin?: string;
  Questions: {
    questionText: string;
    positionInQuiz: number;
    Answers: {
      answerText: string;
      isCorrect: boolean;
    }[];
  }[];
}
export interface SubmitFullQuiz {
  quizName: string;
  quizOwner: string;
  category: string;
  dateTime: Date;
  Questions: {
    questionText: string;
    positionInQuiz: number;
    QuizId: string;
    Answers: {
      answerText: string;
      isCorrect: boolean;
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

export interface ResponseLoginUser {
  id: string;
  token: {
    exp: number;
    iat: number;
    id: string;
    username: string;
  };
  username: string;
}

export interface ResponseRegisterUser {
  token: string;
  dataValues: {
    id: string;
    username: string;
  }
}

export interface UserPost {
  email: string;
  username: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}


// RTK Types
export type RefetchQuizzes = () => QueryActionCreatorResult<
    QueryDefinition<
      void,
      BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        Record<string, never>,
        FetchBaseQueryMeta
      >,
      never,
      Quiz[],
      "backendApi"
    >
  >;
