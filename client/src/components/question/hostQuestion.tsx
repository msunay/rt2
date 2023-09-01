'use client';

import { useState, useEffect } from 'react';
import { QuestionAnswer, QuizQuestionAnswer, Answer } from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';
import style from '@/styles/question.module.css';
import { useAppSelector } from '@/redux/hooks';

export default function HostQuestion({
  hidden,
  trigger,
  quizId,
}: {
  hidden: boolean;
  trigger: number;
  quizId: string;
}) {
  const currentQuestionNumber = useAppSelector(
    (state) => state.questionSlice.value
  );
  const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
    {} as QuizQuestionAnswer
  );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer | null>(
    null
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    userApiService.getOneQuizQuestionAnswer(quizId).then((data) => {
      setQuiz(data);
    });
  }, []);

  useEffect(() => {
    if (quiz.Questions) {
      setCurrentQuestion(quiz.Questions[currentQuestionNumber - 1]);
    }
  }, [quiz, trigger]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  return (
    <div className={style.question_component}>
      {currentQuestion && !hidden && (
        <div className={style.host_question_container}>
          <p className={style.question_text}>{currentQuestion.questionText}</p>
          <div className={style.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <button name="a" key={index} className={`answer${index + 1}`}>
                {answer.answerText}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
