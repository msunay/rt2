import { useAppSelector } from '@/redux/hooks';
import { Quiz } from '@/Types/Types';
import DiscoverQuizCard from './discQuizCard';

export default function DiscoverList() {
  const quizList = useAppSelector((state) => state.discoverSlice.value);
  return (
    <div className="quiz-list-container">
      {quizList.map((quizItem: Quiz) => (
        <div key={quizItem.id}>
          <DiscoverQuizCard quiz={quizItem} />
        </div>
      ))}
    </div>
  );
}
