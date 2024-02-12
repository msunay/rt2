import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  User,
  ResponseUser,
  UserPost,
  Quiz,
  QuizQuestionAnswer,
  Participation,
  ParticipationAndAnswers,
  ParticipationAnswer,
  UserParticipations,
  QuizParticipations,
  Winner,
  LoginCredentials,
  SubmitFullQuiz,
  FullQuizState,
} from '@/types/Types';

const BASE_URL: string =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL!
    : 'http://192.168.0.215:3001/';

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    postUser: build.mutation<ResponseUser, UserPost>({
      query: (user) => ({
        url: 'user',
        method: 'POST',
        body: user,
      }),
    }),

    loginUser: build.mutation<ResponseUser, LoginCredentials>({
      query: ({ username, password }) => ({
        url: 'login',
        method: 'POST',
        body: { username, password },
      }),
    }),

    getUser: build.query<ResponseUser, string>({
      query: (authToken) => ({
        url: 'userId',
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    }),

    getUserDetails: build.query<User, string>({
      query: (userId) => `userDetails/${userId}`,
    }),

    addDemoQuiz: build.mutation<
      Quiz,
      { ownerId: string; startTime: Date; category: string; quizName: string }
    >({
      query: ({ ownerId, startTime, category, quizName }) => ({
        url: 'demoQuiz',
        method: 'POST',
        body: { ownerId, startTime, category, quizName },
      }),
    }),

    addFullQuiz: build.mutation<Quiz, FullQuizState>({
      query: (quiz) => ({
        url: 'quiz',
        method: 'POST',
        body: { ...quiz, dateTime: new Date(quiz.dateTime) },
      }),
    }),

    getOneQuiz: build.query<Quiz, string>({
      query: (quizId) => `quiz/${quizId}`,
    }),

    getAllQuizzes: build.query<Quiz[], void>({
      query: () => 'quizzes',
    }),

    getOneQuizQuestionAnswer: build.query<QuizQuestionAnswer, string>({
      query: (quizId) => `quizQuestionAnswer/${quizId}`,
    }),

    getWinners: build.query<Winner[], string>({
      query: (quizId) => `winners/${quizId}`,
    }),

    addParticipation: build.mutation<
      Participation,
      { quizId: string; userId: string }
    >({
      query: ({ quizId, userId }) => ({
        url: 'participation',
        method: 'POST',
        body: { quizId, userId },
      }),
    }),

    getQuizParticipations: build.query<QuizParticipations, string>({
      query: (quizId) => `quizParticipations/${quizId}`,
    }),

    getUserParticipations: build.query<UserParticipations, string>({
      query: (userId) => `participations/${userId}`,
    }),

    getOneParticipation: build.query<
      Participation,
      { userId: string; quizId: string }
    >({
      query: ({ userId, quizId }) => `participation/${userId}/${quizId}`,
    }),

    getOneParticipationByPartId: build.query<Participation, string>({
      query: (partId) => `participationByPartId/${partId}`,
    }),

    deleteParticipation: build.mutation<
      Participation,
      { userId: string; quizId: string }
    >({
      query: ({ userId, quizId }) => ({
        url: `participation/${userId}/${quizId}`,
        method: 'DELETE',
      }),
    }),

    createParticipationAnswer: build.mutation<
      ParticipationAnswer,
      { AnswerId: string; ParticipationId: string }
    >({
      query: ({ AnswerId, ParticipationId }) => ({
        url: 'participationAnswer',
        method: 'POST',
        body: { AnswerId, ParticipationId },
      }),
    }),

    getParticipationAnswers: build.query<ParticipationAndAnswers, string>({
      query: (participationId) => `participationAnswers/${participationId}`,
    }),
  }),
});

export const {
  usePostUserMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useGetUserDetailsQuery,
  useAddDemoQuizMutation,
  useAddFullQuizMutation,
  useGetOneQuizQuery,
  useGetAllQuizzesQuery,
  useGetOneQuizQuestionAnswerQuery,
  useGetWinnersQuery,
  useAddParticipationMutation,
  useGetQuizParticipationsQuery,
  useGetUserParticipationsQuery,
  useGetOneParticipationQuery,
  useGetOneParticipationByPartIdQuery,
  useDeleteParticipationMutation,
  useCreateParticipationAnswerMutation,
  useGetParticipationAnswersQuery,
} = backendApi;
