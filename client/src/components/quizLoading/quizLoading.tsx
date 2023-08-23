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
    if (participationsList.length && loading) {
      fetchData();
      console.log('Is this working??? fetch');
    }
  }, [participationsList]);

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : nextQuiz && nextParticipation ? (
        <>
          <h1 className="pageTitle">QUIZ LOADING</h1>
          <QuizInfo quiz={nextQuiz} />
          <CountdownTimer
            startTime={nextQuiz?.dateTime}
            participationId={nextParticipation?.id!}
          />
        </>
      ) : (
        <p>No upcoming quiz found.</p>
      )}
    </>
  );
}
