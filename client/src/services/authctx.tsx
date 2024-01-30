// import React from 'react';
import { PropsWithChildren, createContext, useContext } from 'react';
import { useStorageState } from '@/services/useStorageState';
import { useLoginUserMutation } from '@/services/apiService';
import { LoginCredentials } from '@/types/Types';
import { Alert } from 'react-native';

const AuthContext = createContext<{
  signIn: ({ username, password }: LoginCredentials) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async () => {},
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);

  return value;
}

export function SessionProvider(props: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [sendCredentials, { data, error }] = useLoginUserMutation();

  const signIn = async ({ username, password }: LoginCredentials) => {
    await sendCredentials({ username, password })
      .unwrap()
      .then((data) => {
        setSession(data.token); // Set session state with token
      })
      .catch((error) => {
        setSession(null); // Reset session state on failure
        console.error('Login failed:', error);
        Alert.alert(error.data);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
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
