import { Quiz, User } from '@/Types/Types';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Add a request interceptor
apiInstance.interceptors.request.use((config) => {
  const authToken = localStorage.getItem('jwt_token');
  if (authToken) {
    config.headers["Authorization"] = `Bearer ${authToken}`;
  }
  return config;
});

export async function getAllQuizzes(): Promise<Quiz[]> {
  const response = await axios.get<Quiz[]>(`${BASE_URL}quizzes`);
  return response.data;
}

export async function getOwner(): Promise<User[]> {
  const response = await axios.get<User[]>(`${BASE_URL}users`);
  return response.data;
}


export async function getNextQuizForUser (userId: string): Promise<Quiz> {
  try {
    const response = await axios.get<Quiz>(`${BASE_URL}quiz/next-for-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching next quiz:", error);
    return {} as Quiz;
  }
};