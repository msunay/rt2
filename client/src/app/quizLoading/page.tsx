'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import QuizLoadingLayout from './layout';
import QuizInfo from '../../components/quizLoading/QuizInfo';
import CountdownTimer from '../../components/quizLoading/CountdownTimer';
import { userApiService } from '../../redux/services/apiService';
import styles from './quizLoading.module.css';
import { Quiz, Participation } from '@/Types/Types';

// ... (import statements and other code)

export default function QuizLoadingPage() {
  const participationsList = useAppSelector(
    (state) => state.participatingSlice.value
  );
  const [nextQuiz, setNextQuiz] = useState<Quiz | undefined>(undefined);
  const [nextParticipation, setNextParticipation] = useState<
    Participation | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const newQuizList: Quiz[] = [];
      console.log('PARTICIPATIONS LIST::', participationsList);
      for (const participation of participationsList) {
        const data = await userApiService.getOneQuiz(participation.QuizId!);
        newQuizList.push(...data);
      }
      console.log('NEW QUIZ LIST::', newQuizList);
      if (newQuizList.length > 0) {
        newQuizList.sort(
          (quizA, quizB) =>
            new Date(quizA.dateTime).getTime() -
            new Date(quizB.dateTime).getTime()
        );
        const nextQuizData = newQuizList[0];
        setNextQuiz(nextQuizData);
        console.log('NEXT QUIZ::', nextQuizData);
        const newParticipation = participationsList.find(
          (participation) => participation.QuizId === nextQuizData.id
        );
        if (newParticipation) {
          setNextParticipation(newParticipation);
          console.log('NEXT PARTICIPATION::', newParticipation);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [participationsList]);

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : nextQuiz && nextParticipation ? (
        <QuizLoadingLayout>
          <h1 className={styles.pageTitle}>QUIZ LOADING</h1>
          <QuizInfo quiz={nextQuiz} />
          <CountdownTimer
            startTime={nextQuiz?.dateTime}
            participationId={nextParticipation?.id!}
          />
        </QuizLoadingLayout>
      ) : (
        <p>No upcoming quiz found.</p>
      )}
    </>
  );
}