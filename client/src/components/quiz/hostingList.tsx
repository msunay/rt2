'use client';

import { useAppSelector } from '@/redux/hooks';
import { Quiz } from '@/Types/Types';
import HostQuizCard from './hostQuizCard';
import styles from '@/styles/quiz.module.css'

export default function HostingList() {
  const userId = useAppSelector((state) => state.userIdSlice.value);
  const allQuizzes = useAppSelector((state) => state.discoverSlice.value);
  const hostingQuizzes = allQuizzes.filter((quiz) => quiz.quizOwner === userId);

  return (
    <div className={styles.quiz_list_container}>
      {hostingQuizzes.map((quizItem: Quiz) => (
        <HostQuizCard key={quizItem.id} quiz={quizItem} />
      ))}
    </div>
  );
}
