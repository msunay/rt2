'use client'

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setUserId } from '../../redux/features/userIdSlice';
import QuizLoadingLayout from './layout';
import QuizInfo from '../../components/QuizLoadingComponents/QuizInfo';
import CountdownTimer from '../../components/QuizLoadingComponents/CountdownTimer';
import { userApiService } from '../../redux/services/apiService';
import { getNextQuizForUser } from '../../redux/services/quizeApiService';
import { RootState } from '../../redux/store';

export default function QuizLoadingPage() {
  const dispatch = useAppDispatch();
  const authToken = useAppSelector(
    (state: RootState) => state.authSlice.authToken
  );
  const userId = useAppSelector((state: RootState) => state.userIdSlice.value);
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    userApiService.getUserId(authToken).then((data) => {
      dispatch(setUserId(data));
    });
  }, [authToken, dispatch]);

  useEffect(() => {
    if (userId) {
      getNextQuizForUser(userId).then((data) => setQuiz(data));
    }
  }, [userId]);

  if (!quiz) return null;

  return (
    <QuizLoadingLayout>
      <QuizInfo quiz={quiz} />
      <CountdownTimer startTime={quiz.dateTime} />
    </QuizLoadingLayout>
  );
}