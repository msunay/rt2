import { setUserId } from '@/features/userIdSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useGetUserQuery } from '@/services/backendApi';
import { useSession } from '@/utils/authctx';
import { Redirect, Slot } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const { session, isLoading } = useSession();

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href='/login' />;
  }

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const id = useAppSelector(state => state.userIdSlice.id);

  const { data: user } = useGetUserQuery(session);
  // On reload of app get ID with authToken (session)
  useEffect(() => {
    if (!id && user) dispatch(setUserId(user));
  }, [user, dispatch, id]);

  // This layout can be deferred because it's not the root layout.
  return <Slot />;
}
