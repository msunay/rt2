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

  // const styles = {
  //   container: {
  //     'display': 'flex',
  //     'flex-direction': 'column',
  //     'align-items': 'center',
  //     'justify-content': 'center',
  //     'height': '100vh',
  //     'background': 'linear-gradient(#9cc8c8, #3f653d, #415b5f)',
  //     'background-size': 600% 600%,
  //     'animation': 'gradientBackground 25s infinite',
  //     'width': '100%'
  //   }
  // }

  // @keyframes gradientBackground {
  //   0% {
  //     background-position: 100% 50%;
  //   }
  //   50% {
  //     background-position: 50% 100%;
  //   }
  //   100% {
  //     background-position: 100% 50%;
  //   }
  // }

  // .

  // .pageTitle {
  //   font-size: 2rem;
  //   color: #fff;
  //   margin-bottom: 20px;
  //   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  //   position: relative;
  //   transform: translateY(-20vh);
  // }

  // .quizInfoContainer,
  // .countdownContainer {
  //   background-color: rgba(255, 255, 255, 0.6);
  //   border-radius: 10px;
  //   padding: 20px;
  //   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  //   margin-bottom: 20px;
  //   width: 70%;
  //   max-width: 800px;
  //   text-align: center;
  //   transition:
  //     transform 0.3s,
  //     box-shadow 0.3s;
  //   padding: 30px;
  // }

  // .quizInfoContainer:hover,
  // .countdownContainer:hover {
  //   transform: translateY(-5px);
  //   box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
  // }

  // .countdownTime {
  //   /* If time is less than 1 minute, shake animation active */
  //   animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  //   transform: translate3d(0, 0, 0);
  // }

  // .countdownTime {
  //   font-size: 2rem;
  //   font-weight: 500;
  //   padding: 15px;
  // }

  // @media (max-width: 768px) {
  //   .quizInfoContainer,
  //   .countdownContainer {
  //     width: 90%;
  //   }
  // }

  // .contentText {
  //   font-size: 1.1rem;
  //   color: #333;
  //   font-weight: 400;
  //   line-height: 1.5;
  //   margin-bottom: 15px;
  //   text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
  //   margin: auto;
  // }

  // .label {
  //   font-weight: 600;
  //   margin-right: 10px;
  // }

  // .infoGroup {
  //   display: flex;
  //   align-items: center;
  //   justify-content: space-between;
  //   margin-bottom: 10px;
  // }

  // .quizTitle {
  //   font-size: 1.8rem;
  //   font-weight: bold;
  //   text-align: center;
  //   margin: 20px 0;
  //   color: #333;
  //   padding-bottom: 15px;
  // }

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
