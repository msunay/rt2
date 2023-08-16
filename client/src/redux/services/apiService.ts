import axios, { AxiosResponse } from "axios";
import {
  User,
  ResponseUser,
  UserPost,
  Quiz,
  QuizQuestionAnswer,
} from "../../Types";

const BASE_URL = "http://localhost:3001/";

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
      console.log("Error fetching quizzes from database::", err);
      return [];
    }
  },
};
