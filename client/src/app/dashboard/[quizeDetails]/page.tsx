"use client"

import styles from '@/app/dashboard/dashboard.module.css'
import { ReactElement } from "react"
import DiscoverList from '../../../components/quiz/discoverList'
import HostingList from '@/components/quiz/hostingList';
import ParticipatingList from '@/components/quiz/participatingList';

export default function QuizDetails({ params }: { params: { quizeDetails: string } }) {
  let element: ReactElement;

  switch (params.quizeDetails) {
    case 'participant':
      element = <ParticipatingList />
      break;
    case 'hosting':
      element = <HostingList />
      break;
    case 'discovery':
      element = <DiscoverList />
      break;
    default:
      element = <></>
  }

  return (
    <div className={styles.quiz_dynamic_routes_container}>
      {
        element
      }
    </div>
  )
}