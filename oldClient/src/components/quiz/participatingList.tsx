'use client';
import style from '@/styles/quiz.module.css';
import { useAppSelector } from '@/redux/hooks';
import { Participation, Quiz } from '@/Types/Types';
import ParticipationQuizCard from './partQuizCard';
import { userApiService } from '@/redux/services/apiService';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ParticipatingList() {
  const participationsList = useAppSelector(
    (state) => state.participatingSlice.value
  );
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const newQuizList: Quiz[] = [];
      for (const quiz of participationsList.quizzes) {
        newQuizList.push(quiz);
      }
      setQuizList(
        newQuizList.sort(
          (quizA, quizB) =>
            new Date(quizA.dateTime).getTime() -
            new Date(quizB.dateTime).getTime()
        )
      );
      setLoading(false);
    };
    if (participationsList.quizzes && loading) {
      fetchData();
    }
  }, [participationsList]);

  return (
    <div className={style.quiz_list_container}>
      {quizList.length === 0 ? (
        <p>
          You are currently not signed up to any quizzes, checkout the{' '}
          <Link href={'discover/'}>Discover page</Link> to get started.
        </p>
      ) : (
        quizList.map((quizItem: Quiz) => (
          <ParticipationQuizCard
            key={quizItem.id}
            quiz={quizItem}
            quizList={quizList}
            setQuizList={setQuizList}
          />
        ))
      )}
    </div>
  );
}