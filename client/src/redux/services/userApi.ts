import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface UserPost {
  email: string,
  username: string,
  password: string
}

export const apiUser = createApi({
  reducerPath: 'apiUser',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001/' }),
  endpoints: (build) => ({
    addUser: build.mutation<UserPost, Partial<UserPost>>({
      query: (body) => ({
        url: `users`,
        method: 'POST',
        body,
      }),
    }),
  }),
})


export const { useAddUserMutation } = apiUser;