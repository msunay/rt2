'use client';

import { Quiz, Participation } from '@/Types/Types';
import moment from 'moment';
import style from '@/styles/quiz.module.css';
import Link from 'next/link';

export default function HostQuizCard({ quiz }: { quiz: Quiz }) {
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
