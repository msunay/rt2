import axios from "axios";

type User = {
  createdAt: Date
  email: string
  id: string
  isPremiumMember: boolean
  password: string
  pointsWon: number
  updatedAt: Date
  username: string
}

export interface ResponseUser {
  dataValues: User
  token: string
}


interface UserPost {
  email: string,
  username: string,
  password: string
}

const BASE_URL = 'http://localhost:3001/'

export const userApiService = {
  postUser: async function (user: UserPost): Promise<ResponseUser> {
    try {
      const res = await axios.post<ResponseUser>(
        `${BASE_URL}users`,
        { email: user.email, username: user.username, password: user.password }
      );
      const result = res.data;
      return result;
    } catch (error) {
      throw error;
    }
  },

  loginUser: async (username: string): Promise<ResponseUser> => {
    const response = await axios.get<ResponseUser>(`http://localhost:3001/user/${username}`);
    return response.data;
  }

}