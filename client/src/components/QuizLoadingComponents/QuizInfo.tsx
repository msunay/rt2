import React, { useEffect, useState } from 'react';
import { getNextQuizForUser } from '@/redux/services/quizeApiService';

interface QuizInfoProps {
  userId: string;
}

const QuizInfo: React.FC<QuizInfoProps> = ({ userId }) => {
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (userId) {
      getNextQuizForUser(userId).then((data) => {
        setQuiz(data);
      });
    }
  }, [userId]);



  return <div>{}</div>;
};

export default QuizInfo;
