// import React from 'react';
import { PropsWithChildren, createContext, useContext } from 'react';
import { useStorageState } from '@/utils/useStorageState';
import {
  useLoginUserMutation,
  usePostUserMutation,
} from '@/services/backendApi';
import { LoginCredentials, UserPost } from '@/types/Types';
import { Alert } from 'react-native';

// Create context to hold session data and functions
const AuthContext = createContext<{
  signIn?: ({ username, password }: LoginCredentials) => any;
  register?: ({ email, username, password }: UserPost) => any;
  signOut: () => void;
  session: string | null;
  isLoading: boolean;
}>({
  signOut: () => {},
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info through the auth context.
export function useSession() {
  const value = useContext(AuthContext);

  return value;
}

// Provider for session context to be used at root
export function SessionProvider(props: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [sendCredentials] = useLoginUserMutation();
  const [postCredentials] = usePostUserMutation();

  const signIn = async ({ username, password }: LoginCredentials) => {
    return await sendCredentials({ username, password })
      .unwrap() // Use result of sendCredentials mutation
      .then(async (res) => {
        setSession(res.token); // Set session state with token
        return res;
      })
      .catch((error) => {
        setSession(null); // Reset session state on failure
        console.error('Login failed:', error);
        Alert.alert(error.data);
      });
  };

  const register = async ({ email, username, password }: UserPost) => {
    return await postCredentials({ email, username, password })
      .unwrap() // Use result of postCredentials mutation
      .then(async (res) => {
        setSession(res.token); // Set session state with token
        return res;
      })
      .catch((error) => {
        setSession(null); // Reset session state on failure
        console.error('Sign-Up failed:', error);
        Alert.alert(error.data);
      });
  };
  return (
    <AuthContext.Provider
      value={{
        signIn,
        register,
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
