import React from 'react';
import { Quiz } from '../../Types/Types';

interface QuizInfoProps {
  quiz: Quiz;
}

const QuizInfo: React.FC<QuizInfoProps> = ({ quiz }) => {
  return (
    <div>
      <h2>{quiz.quizName}</h2>
      <h3>Hosted by: {quiz.host_name}</h3>
      <h4>Category: {quiz.category}</h4>
    </div>
  );
};

export default QuizInfo;