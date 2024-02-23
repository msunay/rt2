import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/utils/authctx';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { useGetUserParticipationsQuery, useGetUserQuery } from '@/services/backendApi';
import { useEffect } from 'react';
import { setUserId } from '@/features/userIdSlice';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  const dispatch = useAppDispatch();
  const id = useAppSelector((state) => state.userIdSlice.id);
  const { data: user } = useGetUserQuery(session!)



  // On reload of app get ID with authToken (session)
  useEffect(() => {
    if (!id && user) dispatch(setUserId(user));
  }, [user]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }
  // This layout can be deferred because it's not the root layout.
  return <Stack screenOptions={{ headerShown: false }} />;
}
