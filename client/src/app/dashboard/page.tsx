'use client';
import { getAllQuizzes, getOwner } from '@/redux/services/quizeApiService';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import moment from 'moment';
import { Quiz, User } from '@/Types/Types';
import DashboardButton from '@/components/dashboard/dashboardButton';
import { RootState } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [quiz, setQuiz] = useState<Quiz>();
  const [owner, setOwner] = useState<User>();
  const ownerId = useAppSelector((state: RootState) => state.userIdSlice.value);
  const router = useRouter();
  const userDetails = useAppSelector((state) => state.userDetailsSlice.value);

  // The following logic is due to be moved into the "Participating in" component

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const quizes = await getAllQuizzes();
  //       const sortedByDate = quizes.sort((a: Quiz, b: Quiz) =>
  //         moment(a.dateTime).diff(moment(b.dateTime))
  //       );
  //       if (sortedByDate.length) {
  //         const upcomingQuiz = sortedByDate[0];
  //         const responseUsers = await getOwner();
  //         const quizOwner = responseUsers.find(
  //           (user) => user.id === upcomingQuiz.quizOwner
  //         );
  //         setQuiz(upcomingQuiz);
  //         setOwner(quizOwner);
  //       }
  //     } catch (error) {
  //       console.log('failed: ', error);
  //     }
  //   })();
  // }, []);
  // function kicksOffIn() {
  //   const msLeft = moment().diff(quiz?.dateTime);
  //   const duration = moment.duration(msLeft);
  //   return duration.humanize();
  // }

  function streamDirection() {
    if (ownerId === quiz?.quizOwner) router.push('/testHostStream');
    else router.push('/testUserStream');
  }

  return (
    <>
      <div className={styles.dashboard_container}>
        <DashboardButton directTo="/discover" title="Discover Quizzes" />
        <DashboardButton directTo="/participant" title="Participating in" />
        <>
          <DashboardButton
            directTo={
              userDetails.isPremiumMember ? '/hosting' : 'premium-upgrade'
            }
            title="Hosting"
          />
          <DashboardButton
            directTo={
              userDetails.isPremiumMember ? 'create-quiz' : 'premium-upgrade'
            }
            title="Create a Quiz"
          />
        </>
        <div className="total-points">
          POINTS EARNED: {userDetails.pointsWon ? userDetails.pointsWon : 0}
        </div>
      </div>
    </>
  );
}
