'use client';

import styles from '@/styles/dashboard.module.css';
import DashboardButton from '@/components/dashboard/dashboardButton';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/redux/store';
import { userApiService } from '@/redux/services/apiService';
import { useDispatch } from 'react-redux';
import { setQuizList } from '@/redux/features/discoverSlice';
import { setParticipatingList } from '@/redux/features/participatingSlice';
import { setUserId } from '@/redux/features/userIdSlice';
import { setUserDetails } from '@/redux/features/userDetailsSlice';
import axios from 'axios';

export default function Dashboard() {
  const userDetails = useAppSelector((state) => state.userDetailsSlice.value);
  const router = useRouter();
  const userId = useAppSelector((state: RootState) => state.userIdSlice.value);
  const dispatch = useDispatch();
  const authToken = useAppSelector(
    (state: RootState) => state.authSlice.authToken
  );
  const BASE_URL: string =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_BACKEND_URL!
      : 'http://localhost:3001/';

  useEffect(() => {
    axios
      .get(BASE_URL, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        if (res.status !== 200) {
          router.push('/');
        }
      })
      .catch((error) => {
        router.push('/');
        console.log('failed: ', error.message);
      });
    userApiService.getAllQuizzes().then((data) => dispatch(setQuizList(data)));
    userApiService
      .getUserId(authToken)
      .then((data) => dispatch(setUserId(data)));
  }, []);

  useEffect(() => {
    if (userId) {
      userApiService
        .getUserDetails(userId)
        .then((data) => dispatch(setUserDetails(data)));
      userApiService.getUserParticipations(userId).then((data) => {
        dispatch(setParticipatingList(data));
      });
    }
  }, [userId]);

  return (
      <div className={styles.dashboard_container}>
        <div>
         <DashboardButton directTo='/quizLoading' title="Play Next Quiz" />
        </div>
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
  );
}