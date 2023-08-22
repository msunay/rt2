import styles from '@/styles/quiz.module.css';
import { useAppSelector } from '@/redux/hooks';
import { Quiz } from '@/Types/Types';
import DiscoverQuizCard from './discQuizCard';


export default function DiscoverList() {
  const quizList = useAppSelector((state) => state.discoverSlice.value);
  return (
    <div className={styles.quiz_list_container}>
      {quizList.map((quizItem: Quiz) => (
        <DiscoverQuizCard 
          key={quizItem.id}
          quiz={quizItem} 
        />
      ))}
    </div>
  );
}
