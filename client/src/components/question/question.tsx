import { useState, useEffect } from 'react';
import { QuestionAnswer, QuizQuestionAnswer } from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';

export default function Question() {
  // LOGIC FOR HOSTING THE QUIZ
  const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
    {} as QuizQuestionAnswer
  );

  useEffect(() => {
    userApiService
      .getOneQuizQuestionAnswer('98e03864-eec4-4800-941c-4b1dbe78301f')
      .then((data) => {
        setQuiz(data);
        console.log(data.Questions[0]);
      });
  }, []);

  let currentQuestionNumber;
  let currentQuestion;

  useEffect(() => {
    let currentQuestionNumber = 0;
    let currentQuestion: QuestionAnswer = quiz.Questions[currentQuestionNumber];
  }, [quiz]);

  return (
    <>
      { quiz &&<div className="question-container">
        <div className="question-text">{currentQuestion.questionText}</div>
      </div>}
    </>
  );
}
