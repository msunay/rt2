import { useState, useEffect } from 'react';
import { QuestionAnswer, QuizQuestionAnswer, Answer } from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';
import style from './question.module.css';

export default function Question({
  currentQuestionNumber,
  setCurrentQuestionNumber,
}: {
  currentQuestionNumber: number;
  setCurrentQuestionNumber: React.Dispatch<React.SetStateAction<number>>;
}) {
  // LOGIC FOR HOSTING THE QUIZ
  const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
    {} as QuizQuestionAnswer
  );

  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer | null>(
    null
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[] | null>(null);

  // function handleAnswer () {
  //   userApiService.
  // }
  useEffect(() => {
    userApiService
      .getOneQuizQuestionAnswer('c55e5afe-78c5-473a-ad96-a06b988c2539')
      .then((data) => {
        setQuiz(data);
      });
  }, []);

  useEffect(() => {
    if (
      quiz.Questions &&
      quiz.Questions.length > 0 &&
      quiz.Questions[currentQuestionNumber].Answers
    ) {
      setCurrentQuestion(quiz.Questions[currentQuestionNumber]);
    }
  }, [quiz, currentQuestionNumber]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  return (
    <>
      {currentQuestion && (
        <div className={style.question_container}>
          <p className={style.question_text}>{currentQuestion.questionText}</p>
          <div className={style.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <button key={index} className={`answer answer${index + 1}`}>
                {answer.answerText}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
