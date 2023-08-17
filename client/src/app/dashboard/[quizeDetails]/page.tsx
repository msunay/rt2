import styles from '@/app/dashboard/dashboard.module.css'
import { ReactElement } from "react"


export default function QuizDetails({ params }: { params: { quizeDetails: string } }) {
  let element: ReactElement;

  switch (params.quizeDetails) {
    case 'participant':
      element = <div>participant in list</div>
      break;
    case 'hosting':
      element = <div>hosting details</div>
      break;
    case 'discovery':
      element = <div>discovery</div>
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