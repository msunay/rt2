import styles from '@/styles/quiz.module.css';
import { useAppSelector } from '@/redux/hooks';
import { Quiz } from '@/Types/Types';
import DiscoverQuizCard from './discQuizCard';

export default function DiscoverList() {
  const quizList = useAppSelector((state) => state.discoverSlice.value);
  const sortedQuizList = [...quizList]
    .sort(
      (quizA, quizB) =>
        new Date(quizA.dateTime).getTime() - new Date(quizB.dateTime).getTime()
    )
    .filter((quiz) => new Date(quiz.dateTime).getTime() > Date.now());
  return (
    <div className={styles.quiz_list_container}>
      {sortedQuizList.map((quizItem: Quiz) => (
        <DiscoverQuizCard key={quizItem.id} quiz={quizItem} />
      ))}
    </div>
  );
}
