import { Quiz, Participation } from '@/Types/Types';
import moment from 'moment';
import Image from 'next/image';
import plus from '@/public/plus-square.svg';
import tick from '@/public/check.gif';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { userApiService } from '@/redux/services/apiService';
import style from '@/app/dashboard/dashboard.module.css';

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

  async function handleAdd() {
    try {
      await userApiService.addParticipation(quiz.id!, userId);
      setIsSignedUp(true);
    } catch (err) {
      console.log(err);
    }
  }
  async function handleRemove() {
    try {
      if (participationId) {
        await userApiService.deleteParticipation(participationId);
      }
      setIsSignedUp(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <div className={style.quiz_card_container}>
        <div className={style.quiz_info}>
          <h2>{quiz.quizName}</h2>
          <h4>{quiz.category}</h4>
          <h4>{moment(quiz.dateTime).format('dddd D MMM H:mm')}</h4>
        </div>
      </div>
    </>
  );
}
