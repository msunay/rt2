import styles from '@/app/dashboard/dashboard.module.css'
import { ReactElement } from "react"


export default function QuizDetails({ params }: { params: { quizeDetails: string } }) {
  let element: ReactElement;

  switch (params.quizeDetails) {
    case 'participant':
      element = <div>the main one</div>
      break;
    case 'hosting':
      element = <div>second</div>
      break;
    case 'discovery':
      element = <div>third</div>
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