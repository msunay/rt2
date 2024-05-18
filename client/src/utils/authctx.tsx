import { useStorageState } from '@/hooks/useStorageState';
import { useLoginUserMutation, usePostUserMutation } from '@/services/backendApi';
import type {
  LoginCredentials,
  ResponseLoginUser,
  ResponseRegisterUser,
  UserPost,
} from '@/types/Types';
import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import { Alert } from 'react-native';

// Create context to hold session data and functions
const AuthContext = createContext<{
  signIn?: ({ username, password }: LoginCredentials) => Promise<ResponseLoginUser>;
  register?: ({ email, username, password }: UserPost) => Promise<ResponseRegisterUser>;
  signOut?: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  // session: null,
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
    try {
      const responseUser: ResponseLoginUser = await sendCredentials({
        username,
        password,
      }).unwrap(); // Use result of sendCredentials mutation

      setSession(responseUser.token); // Set session state with token
      return responseUser;
    } catch (error) {
      setSession(null); // Reset session state on failure
      console.error('Login failed:', error);
      Alert.alert('Login failed');

      return Promise.reject(error);
    }
  };

  const register = async ({ email, username, password }: UserPost) => {
    try {
      const responseUser: ResponseRegisterUser = await postCredentials({
        email,
        username,
        password,
      }).unwrap(); // Use result of postCredentials mutation

      setSession(responseUser.token);
      return responseUser;
    } catch (error) {
      setSession(null); // Reset session state on failure
      console.error('Sign-Up failed:', error);
      Alert.alert('Sign-Up failed');

      return Promise.reject(error);
    }
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
