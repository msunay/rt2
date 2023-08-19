'use client';

import styles from '@/app/dashboard/dashboard.module.css';
import { ReactElement } from 'react';
import DiscoverList from '../../../components/quiz/discoverList';
import HostingList from '@/components/quiz/hostingList';
import ParticipatingList from '@/components/quiz/participatingList';
import PremiumUpgrade from '@/components/quiz/premiumUpgrade';
import CreateQuiz from '@/components/quiz/createQuiz';

export default function QuizDetails({
  params,
}: {
  params: { quizDetails: string };
}) {
  let element: ReactElement;

  switch (params.quizDetails) {
    case 'participant':
      element = <ParticipatingList />;
      break;
    case 'hosting':
      element = <HostingList />;
      break;
    case 'discover':
      element = <DiscoverList />;
      break;
    case 'premium-upgrade':
      element = <PremiumUpgrade />;
      break;
    case 'create-quiz':
      element = <CreateQuiz />;
      break;
    default:
      element = <></>;
  }

  return <div className={styles.quiz_dynamic_routes_container}>{element}</div>;
}
