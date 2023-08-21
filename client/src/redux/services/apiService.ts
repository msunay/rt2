import axios, { AxiosResponse } from 'axios';
import {
  User,
  ResponseUser,
  UserPost,
  Quiz,
  QuizQuestionAnswer,
  Participation,
  ParticipationAndAnswers,
  ParticipationAnswer,
} from '../../Types/Types';

export const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/';

export const userApiService = {
  // User methods

  postUser: async function (user: UserPost): Promise<ResponseUser> {
    try {
      const res = await axios.post<ResponseUser>(`${BASE_URL}user`, {
        email: user.email,
        username: user.username,
        password: user.password,
      });
      const result = res.data;
      return result;
    } catch (error) {
      throw error;
    }
  },

  loginUser: async (username: string): Promise<ResponseUser> => {
    const response = await axios.get<ResponseUser>(
      `${BASE_URL}user/${username}`
    );
    return response.data;
  },

  getUserId: async (authToken: string): Promise<string> => {
    try {
      const response = await axios.get<string>(`${BASE_URL}userId`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (err) {
      console.log('Error fetching user id::', err);
      return '';
    }
  },

  getUserDetails: async (userId: string): Promise<User> => {
    try {
      const response = await axios.get<User>(
        `${BASE_URL}userDetails/${userId}`
      );
      return response.data;
    } catch (err) {
      console.log('Failed to fetch user details');
      return {} as User;
    }
  },

  // Quiz methods

  getOneQuiz: async (quizId: string): Promise<Quiz[]> => {
    try {
      const response = await axios.get<Quiz[]>(`${BASE_URL}quiz/${quizId}`);
      return response.data;
    } catch (err) {
      console.log('Error fetching quizzes from database::', err);
      return [];
    }
  },

  getAllQuizzes: async (): Promise<Quiz[]> => {
    try {
      const response = await axios.get<Quiz[]>(`${BASE_URL}quizzes`);
      return response.data;
    } catch (err) {
      console.log('Error fetching quizzes from database::', err);
      return [];
    }
  },

  getOneQuizQuestionAnswer: async (
    quizId: string
  ): Promise<QuizQuestionAnswer> => {
    try {
      const response = await axios.get(
        `${BASE_URL}quizQuestionAnswer/${quizId}`
      );
      return response.data[0]; //TODO
    } catch (err) {
      console.log(err);
      return {} as QuizQuestionAnswer;
    }
  },

  // Participation methods

  addParticipation: async (
    quizId: string,
    userId: string
  ): Promise<Participation> => {
    try {
      const response = await axios.post<Participation>(
        `${BASE_URL}participation`,
        {
          quizId: quizId,
          userId: userId,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return {} as Participation;
    }
  },

  getUserParticipations: async (userId: string): Promise<Participation[]> => {
    try {
      const response = await axios.get<Participation[]>(
        `${BASE_URL}participations/${userId}`
      );
      return response.data;
    } catch (err) {
      console.log('Error fetching participations from database::', err);
      return [];
    }
  },

  getOneParticipation: async (participationId: string): Promise<Participation> => {
    try {
      const response = await axios.get<Participation>(
        `${BASE_URL}participation/${participationId}`
      );
      return response.data
    } catch (err) {
      console.log('Error fetching participation::',err);
      return {} as Participation;
    }
  },

  deleteParticipation: async (
    participationId: string
  ): Promise<Participation> => {
    try {
      const response = await axios.delete<Participation>(
        `${BASE_URL}participation/${participationId}`
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return {} as Participation;
    }
  },

  // ParticipationAnswer reference table methods

  createParticipationAnswer: async ({
    AnswerId,
    ParticipationId,
  }: {
    AnswerId: string;
    ParticipationId: string;
  }): Promise<ParticipationAnswer> => {
    try {
      const response = await axios.post<ParticipationAnswer>(
        `${BASE_URL}participationAnswer`,
        {
          AnswerId,
          ParticipationId,
        }
      );
      return response.data;
    } catch (err) {
      return {} as ParticipationAnswer;
    }
  },
  getParticipationAnswers: async (
    participationId: string
  ): Promise<ParticipationAndAnswers[]> => {
    try {
      const response = await axios.get<ParticipationAndAnswers[]>(
        `${BASE_URL}participationAnswers/${participationId}`
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
};
