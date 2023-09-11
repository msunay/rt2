'use client';

import { Quiz, Participation } from '@/Types/Types';
import moment from 'moment';
import style from '@/styles/quiz.module.css';
import Link from 'next/link';
import { Switch, FormControlLabel } from '@mui/material';
import { useEffect, useState } from 'react';

export default function HostQuizCard({ quiz }: { quiz: Quiz }) {
  const [videoToggle, setVideoToggle] = useState(false)

  function handleVideoToggle () {
    setVideoToggle(bool => !bool)

  }
  return (
    <div className={style.quiz_card_container}>
      <Link href={'/hostQuiz/' + quiz.id}>
        <div className={style.quiz_info}>
          <h2>{quiz.quizName}</h2>
          <h4>{quiz.category}</h4>
          <p>{moment(quiz.dateTime).format('dddd D MMM H:mm')}</p>
        </div>
      </Link>
      <FormControlLabel control={<Switch onChange={handleVideoToggle} checked={videoToggle}/>} label="Video"/>
    </div>
  );
}
