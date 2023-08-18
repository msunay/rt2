import axios, { AxiosResponse } from 'axios';
import {
  User,
  ResponseUser,
  UserPost,
  Quiz,
  QuizQuestionAnswer,
  Participation,
  ParticipationAndAnswers,
} from '../../Types/Types';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/';

export const userApiService = {
  postUser: async function (user: UserPost): Promise<ResponseUser> {
    try {
      const res = await axios.post<ResponseUser>(`${BASE_URL}users`, {
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

  getOneQuiz: async (quizId: string): Promise<Quiz[]> => {
    try {
      const response = await axios.get<Quiz[]>(`${BASE_URL}quiz/${quizId}`);
      return response.data;
    } catch (err) {
      console.log('Error fetching quizzes from database::', err);
      return [];
    }
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

  getUserParticipations: async (
    authToken: string
  ): Promise<Participation[]> => {
    try {
      const response = await axios.get<Participation[]>(
        `${BASE_URL}participations`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.log('Error fetching participations from database::', err);
      return [];
    }
  },

  addParticipation: async (
    quizId: string,
    authToken: string
  ): Promise<Participation> => {
    try {
      const response = await axios.post<Participation>(
        `${BASE_URL}participation`,
        {
          quizId: quizId,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return {
        UserId: '',
        QuizId: '',
        isPaid: false,
      };
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
