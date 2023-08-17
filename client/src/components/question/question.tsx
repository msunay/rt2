import { useState, useEffect } from 'react';
import { QuestionAnswer, QuizQuestionAnswer, Answer } from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';

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

  useEffect(() => {
    userApiService
      .getOneQuizQuestionAnswer('98e03864-eec4-4800-941c-4b1dbe78301f')
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
        <div className="question-container">
          <div className="question-text">{currentQuestion.questionText}</div>
          <div className="answer-container">
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
