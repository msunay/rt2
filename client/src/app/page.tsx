'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { userApiService } from '@/redux/services/apiService';
import { setQuizList } from '@/redux/features/discoverSlice';
import { setParticipatingList } from '@/redux/features/participatingSlice';
import { setUserId } from '@/redux/features/userIdSlice';
import axios from 'axios';
import Dashboard from './dashboard/page';
import { setUserDetails } from '@/redux/features/userDetailsSlice';

export default function Home() {
  const authToken = useAppSelector(
    (state: RootState) => state.authSlice.authToken
  );
  const userId = useAppSelector((state: RootState) => state.userIdSlice.value);
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    userApiService
      .getUserId(authToken)
      .then((data) => dispatch(setUserId(data)));
    axios
      .get('http://localhost:3001/', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        if (res.status !== 200) {
          router.push('/auth');
        }
      })
      .catch((error) => {
        router.push('/auth');
        console.log('failed: ', error.message);
      });

    userApiService.getAllQuizzes().then((data) => dispatch(setQuizList(data)));

    if (userId) {
      userApiService
        .getUserDetails(userId)
        .then((data) => dispatch(setUserDetails(data)));
      userApiService
        .getUserParticipations(userId)
        .then((data) => dispatch(setParticipatingList(data)));
    }
  }, []);
  return (
    <main>
      <Dashboard />
    </main>
  );
}
