import React from 'react';
import { Quiz } from '../../Types/Types';

export default function QuizInfo({ quiz }: { quiz: Quiz }) {
  return (
    <div className="quizInfoContainer">
      <h2 className="quizTitle">{quiz.quizName}</h2>
      <div className="infoGroup">
        <span className="contentText">Category: {quiz.category}</span>
      </div>
    </div>
  );
}
