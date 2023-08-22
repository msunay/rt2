'use client'

import React, { useEffect } from 'react';
import QuizLoadingLayout from './layout';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { userApiService } from '@/redux/services/apiService';
import { useAppSelector } from '@/redux/hooks';
import { setUserId } from '@/redux/features/userIdSlice';
import QuizInfo from '../../components/QuizLoadingComponents/QuizInfo';
//import CountdownTimer from '../components/QuizLoadingComponents/CountdownTimer';

export default function QuizLoadingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const authToken = useAppSelector(
    (state: RootState) => state.authSlice.authToken
  );
  const userId = useAppSelector((state: RootState) => state.userIdSlice.value);

  useEffect(() => {
    userApiService.getUserId(authToken).then((data) => {
      dispatch(setUserId(data));
    });
  }, [authToken, dispatch]);

  return (
    <QuizLoadingLayout>
      <QuizInfo userId={userId} />
      {/* Uncomment
      <CountdownTimer startTime={nextQuiz?.startTime} />*/}
    </QuizLoadingLayout>
  );
}

