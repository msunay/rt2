'use client';
import style from '@/styles/quiz.module.css';
import { useAppSelector } from '@/redux/hooks';
import { Participation, Quiz } from '@/Types/Types';
import ParticipationQuizCard from './partQuizCard';
import { userApiService } from '@/redux/services/apiService';
import { useState, useEffect } from 'react';

export default function ParticipatingList() {
  const participationsList = useAppSelector(
    (state) => state.participatingSlice.value
  );
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const newQuizList: Quiz[] = [];
      for (const participation of participationsList) {
        const data = await userApiService.getOneQuiz(participation.QuizId!);
        newQuizList.push(...data);
      }
      setQuizList(newQuizList);
      setLoading(false);
    };
    if (participationsList.length && loading) {
      fetchData();
    }
  }, [participationsList]);

  return (
    <div className={style.quiz_list_container}>
      {loading ? (
        <p>Loading...</p>
      ) : (
        quizList.map((quizItem: Quiz) => (
          <ParticipationQuizCard
            key={quizItem.id}
            quiz={quizItem}
            quizList={quizList}
            setQuizList={setQuizList}
          />
        ))
      )}
    </div>
  );
}
