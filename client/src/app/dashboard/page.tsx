'use client';

import styles from './dashboard.module.css';
import DashboardButton from '@/components/dashboard/dashboardButton';
import { useAppSelector } from '@/redux/hooks';

export default function Dashboard() {
  const userDetails = useAppSelector((state) => state.userDetailsSlice.value);

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

// TODO Ask Atai -> Removing this code did not change functionality of the page. What was it meant for?

// import { useRouter } from 'next/navigation';
// const router = useRouter();
// function streamDirection() {
//   if (userDetails.id === quiz?.quizOwner) router.push('/testHostStream');
//   else router.push('/testUserStream');
// }

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
