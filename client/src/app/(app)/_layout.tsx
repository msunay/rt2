import SkeletonLoader from '@/components/homeScreen/skeletonLoader';
import { setUserId } from '@/features/userIdSlice';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { useGetUserQuery } from '@/services/backendApi';
import { useSession } from '@/utils/authctx';
import { Redirect, Slot, router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import { useSpinDelay } from 'spin-delay';

export default function AppLayout() {

  const { session, isLoading } = useSession();

  const userId = useSetUserId(session);

  const isLoadingSpinDelay = useSpinDelay(isLoading);

  if (isLoadingSpinDelay) {
    return (
      <View
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoaderKit
          style={{ width: 50, height: 50, alignSelf: 'center' }}
          name={'BallRotate'} // Optional: see list of animations below
          color={'#25CED1'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
        />
      </View>
    );
  }
  // If the user is not authenticated, redirect them to the login page.
  if (!session && !isLoadingSpinDelay) {
    return <Redirect href='/login' />;
  }
  // If problem with authentication token, redirect to login page.
  if (userId === 'invalid token') {
    setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return (
      <View
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Invalid token. You'll be redirected to the login screen.</Text>
      </View>
    );
  }

  // If the user is authenticated, render the Slot component.
  if (session && userId) {
    return <Slot />;
  }
}

const useSetUserId = (session: string | null | undefined) => {
  const dispatch = useAppDispatch();

  const { data: userId, isError, error } = useGetUserQuery(session || '');

  useEffect(() => {
    if (!isError && userId) {
      dispatch(setUserId(userId));
    }
  }, [userId, dispatch, isError]);


  return userId ? userId : error ? 'invalid token' : null;
};
