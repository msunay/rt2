import React, { useEffect, useState } from 'react';
import { getNextQuizForUser } from '@/redux/services/quizeApiService';

interface QuizInfoProps {
  userId: string;
}

const QuizInfo: React.FC<QuizInfoProps> = ({ userId }) => {
  const [quiz, setQuiz] = useState<{ quizName?: string, host_name?: string, category?: string } | null>(null);

  useEffect(() => {
    if (userId) {
      getNextQuizForUser(userId).then((data) => {
        if(data) {
          setQuiz({
            quizName: data.quizName,
            host_name: data.host_name,
            category: data.category
          });
        }
      });
    }
  }, [userId]);

  if(!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>{quiz.quizName}</p>
      <p>{quiz.host_name}</p>
      <p>{quiz.category}</p>
    </div>
  );
};

export default QuizInfo;

