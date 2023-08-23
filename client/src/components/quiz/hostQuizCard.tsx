'use client'

import { Quiz, Participation } from '@/Types/Types';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { userApiService } from '@/redux/services/apiService';
import style from '@/styles/quiz.module.css';
import Link from 'next/link';

export default function HostQuizCard({ quiz }: { quiz: Quiz }) {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [participationId, setParticipationId] = useState('');
  const [participationList, setParticipationList] = useState<Participation[]>(
    []
  );

  const userId = useAppSelector((state) => state.userIdSlice.value);

  useEffect(() => {
    userApiService.getUserParticipations(userId).then((data) => {
      setParticipationList(data);
    });
  }, [isSignedUp]);

  useEffect(() => {
    if (participationList.some((element) => element.QuizId === quiz.id)) {
      setIsSignedUp(true);
    } else {
      setIsSignedUp(false);
    }
    if (participationList.length > 0 && participationList[0].id) {
      const newParticipationId = participationList.find(
        (participation) => participation.QuizId === quiz.id
      )?.id;
      if (newParticipationId) {
        setParticipationId(newParticipationId);
      }
    }
  }, [participationList]);

  return (
    <Link href={'/hostQuiz/' + quiz.id}>
      <div className={style.quiz_card_container}>
        <div className={style.quiz_info}>
          <h2>{quiz.quizName}</h2>
          <h4>{quiz.category}</h4>
          <p>{moment(quiz.dateTime).format('dddd D MMM H:mm')}</p>
        </div>
      </div>
    </Link>
  );
}
