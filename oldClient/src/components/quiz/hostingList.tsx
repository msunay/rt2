'use client';

import { useAppSelector } from '@/redux/hooks';
import { Quiz } from '@/Types/Types';
import HostQuizCard from './hostQuizCard';
import styles from '@/styles/quiz.module.css';

export default function HostingList() {
  const userId = useAppSelector((state) => state.userIdSlice.value);
  const allQuizzes = useAppSelector((state) => state.discoverSlice.value);
  const hostingQuizzes = allQuizzes.filter((quiz) => quiz.quizOwner === userId);
  const sortedHostingQuizzes = hostingQuizzes
    .sort(
      (quizA, quizB) =>
        new Date(quizA.dateTime).getTime() - new Date(quizB.dateTime).getTime()
    )
    .filter((quiz) => new Date(quiz.dateTime).getTime() > Date.now());
  return (
    <div className={styles.quiz_list_container}>
      {sortedHostingQuizzes.map((quizItem: Quiz) => (
        <HostQuizCard key={quizItem.id} quiz={quizItem} />
      ))}
    </div>
  );
}
