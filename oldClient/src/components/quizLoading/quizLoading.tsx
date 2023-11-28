import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import QuizInfo from './QuizInfo';
import CountdownTimer from './CountdownTimer';
import { userApiService } from '../../redux/services/apiService';
import { Quiz, Participation } from '@/Types/Types';
import styles from '@/styles/quizLoading.module.css';

export default function QuizLoading() {
  const participationsList = useAppSelector(
    (state) => state.participatingSlice.value
  );
  const userId = useAppSelector((state) => state.userIdSlice.value);
  const [nextQuiz, setNextQuiz] = useState<Quiz | undefined>(undefined);
  const [nextParticipation, setNextParticipation] = useState<
    Participation | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (participationsList.quizzes.length > 0) {
        const newQuizList = participationsList.quizzes.sort(
          (quizA, quizB) =>
            new Date(quizA.dateTime).getTime() -
            new Date(quizB.dateTime).getTime()
        );
        const nextQuizData = newQuizList[0];
        setNextQuiz(nextQuizData);
        const newParticipation = await userApiService.getOneParticipation(
          userId,
          nextQuizData.id!
        );
        if (newParticipation) {
          setNextParticipation(newParticipation);
        }
      }
      setLoading(false);
    };
    if (participationsList.quizzes.length && loading) {
      fetchData();
    }
  }, [participationsList]);

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : nextQuiz && nextParticipation ? (
        <div className={styles.container}>
          <QuizInfo quiz={nextQuiz} />
          <CountdownTimer
            startTime={nextQuiz?.dateTime}
            participationId={nextParticipation?.id!}
          />
        </div>
      ) : (
        <p>No upcoming quiz found.</p>
      )}
    </>
  );
}
