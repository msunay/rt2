'use client';
import { Quiz, Participation } from '@/Types/Types';
import moment from 'moment';
import Image from 'next/image';
import plus from '@/public/add_icon.svg';
import tick from '@/public/check_icon.svg';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { userApiService } from '@/redux/services/apiService';
import style from '@/styles/quiz.module.css';

export default function DiscoverQuizCard({ quiz }: { quiz: Quiz }) {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [participationList, setParticipationList] = useState<Quiz[]>([]);
  const userId = useAppSelector((state) => state.userIdSlice.value);

  useEffect(() => {
    userApiService.getUserParticipations(userId).then((data) => {
      setParticipationList(data.quizzes);
    });
  }, [isSignedUp]);

  useEffect(() => {
    if (participationList && participationList.length) {
      if (participationList.some((element) => element.id === quiz.id)) {
        setIsSignedUp(true);
      } else {
        setIsSignedUp(false);
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
      const quizId = quiz.id;
      await userApiService.deleteParticipation(userId, quizId!);
      setIsSignedUp(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className={style.quiz_card_container}>
      <div className={style.quiz_info}>
        <h2>{quiz.quizName}</h2>
        <h4>{quiz.category}</h4>
        <p>{moment(quiz.dateTime).format('dddd D MMM H:mm')}</p>
      </div>
      {isSignedUp === true ? (
        <Image
          onClick={handleRemove}
          className={style.btn_icon}
          src={tick}
          alt="tick icon"
          width={60}
          height={60}
        />
      ) : (
        <Image
          onClick={handleAdd}
          className={style.btn_icon}
          src={plus}
          alt="plus icon"
          width={60}
          height={60}
        />
      )}
    </div>
  );
}
