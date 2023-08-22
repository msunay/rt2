'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setUserId } from '../../redux/features/userIdSlice';
import QuizLoadingLayout from './layout';
import QuizInfo from '../../components/quizLoading/QuizInfo';
import CountdownTimer from '../../components/quizLoading/CountdownTimer';
import { userApiService } from '../../redux/services/apiService';
import { RootState } from '../../redux/store';
import styles from './quizLoading.module.css';
import { Quiz } from '@/Types/Types';

export default function QuizLoadingPage() {
  const participationsList = useAppSelector(
    (state) => state.participatingSlice.value
  );
  const [nextQuiz, setNextQuiz] = useState<Quiz>({} as Quiz);

  useEffect(() => {
    const fetchData = async () => {
      const newQuizList: Quiz[] = [];
      for (const participation of participationsList) {
        const data = await userApiService.getOneQuiz(participation.QuizId!);
        newQuizList.push(...data);
      }
      newQuizList.sort(
        (quizA, quizB) => quizA.dateTime.getTime() - quizB.dateTime.getTime()
      );
      setNextQuiz(newQuizList[0]);
    };
    fetchData();
  }, [participationsList]);

  return (
    <QuizLoadingLayout>
      <h1 className={styles.pageTitle}>QUIZ LOADING</h1>
      <QuizInfo quiz={nextQuiz} />
      <CountdownTimer startTime={nextQuiz.dateTime} />
    </QuizLoadingLayout>
  );
}
