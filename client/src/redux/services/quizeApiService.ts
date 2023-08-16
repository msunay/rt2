import { Quiz, User } from "@/Types";
import axios from "axios";

const BASE_URL = 'http://localhost:3001/'

export async function getAllQuizzes(): Promise<Quiz[]> {
  const response = await axios.get<Quiz[]>(`${BASE_URL}quizzes`);
  return response.data;
}

export async function getOwner(): Promise<User[]> {
  const response = await axios.get<User[]>(`${BASE_URL}users`);
  return response.data;
}

