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
  host_name?: string;
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

export interface QuestionAnswer {
    id: string;
    questionText: string;
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
    }
  }[]
}

export interface ResponseUser {
  dataValues: User;
  token: string;
}

export interface UserPost {
  email: string;
  username: string;
  password: string;
}
