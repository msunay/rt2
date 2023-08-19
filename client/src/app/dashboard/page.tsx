'use client';
import { getAllQuizzes, getOwner } from '@/redux/services/quizeApiService';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import moment from 'moment';
import { Quiz, User } from '@/Types/Types';
import DashboardButton from '@/components/dashboard/dashboar-button';
import { RootState } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [quiz, setQuiz] = useState<Quiz>();
  const [owner, setOwner] = useState<User>();
  const ownerId = useAppSelector((state: RootState) => state.userIdSlice.value);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const quizes = await getAllQuizzes();
        const sortedByDate = quizes.sort((a: Quiz, b: Quiz) =>
          moment(a.dateTime).diff(moment(b.dateTime))
          );
          if (sortedByDate.length) {
            const upcomingQuiz = sortedByDate[0];
            const responseUsers = await getOwner();
          const quizOwner = responseUsers.find(
            (user) => user.id === upcomingQuiz.quizOwner
          );
          setQuiz(upcomingQuiz);
          setOwner(quizOwner);
        }
      } catch (error) {
        console.log('failed: ', error);
      }
    })();
  }, []);

  useEffect(() => {
    console.log('quiz: ', quiz);
  }, [quiz])

  function kicksOffIn() {
    const msLeft = moment().diff(quiz?.dateTime);
    const duration = moment.duration(msLeft);
    return duration.humanize();
  }

  function streamDirection() {
    if (ownerId === quiz?.quizOwner) router.push('/testHostStream');
    else router.push('/testUserStream');
  }

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.quiz_contaniner} onClick={() => streamDirection()}>
        <h4>next quiz</h4>
        <div className={styles.quiz_details}>
          <div>
            <p>
              <strong>Name:</strong>
            </p>
            <p>
              <strong>Quiz host:</strong>
            </p>
            <p>
              <strong>Quiz category:</strong>
            </p>
          </div>
          <div>
            <p>{quiz?.quizName}</p>
            <p>{owner?.username}</p>
            <p>{quiz?.category}</p>
          </div>
        </div>
        <span className={styles.divider}></span>
        <div className={styles.date_container}>
          <strong>starting in: </strong>
          <span>{kicksOffIn()} </span>
        </div>
      </div>
      <Link href="/testHostStream">HostQuiz</Link>
      <DashboardButton directTo="/participant" title="Participating in" />
      <DashboardButton directTo="/hosting" title="Hosting" />
      <DashboardButton directTo="/discover" title="Discover Quizzes" />
    </div>
  );
}
