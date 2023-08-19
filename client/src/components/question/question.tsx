import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  QuestionAnswer,
  QuizQuestionAnswer,
  Answer,
  Participation,
} from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';
import style from './question.module.css';

export default function Question({
  currentQuestionNumber,
  setCurrentQuestionNumber,
}: {
  currentQuestionNumber: number;
  setCurrentQuestionNumber: React.Dispatch<React.SetStateAction<number>>;
}) {
  const userId = useAppSelector((state) => state.userIdSlice.value);
  useEffect(() => {
    console.log('UserID: ', userId);
  }, [userId]);
  // const dispatch = useAppDispatch();
  // LOGIC FOR HOSTING THE QUIZ
  const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
    {} as QuizQuestionAnswer
  );

  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer | null>(
    null
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [userParticipation, setUserParticipation] = useState<Participation>(
    {} as Participation
  );
  // function handleAnswer () {
  //   userApiService.
  // }
  useEffect(() => {
    userApiService
      .getOneQuizQuestionAnswer('98e03864-eec4-4800-941c-4b1dbe78301f')
      .then((data) => {
        setQuiz(data);
      });
    userApiService
      .getUserParticipations(userId)
      .then((participationArr) => {
        setUserParticipation(participationArr.filter((elem) => elem.id === quiz.id)[0])
        console.log(participationArr);
      });
    ;
  }, [userId]);

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

  async function handleAnswerClick(e: any) {
    console.log('userParticipation', userParticipation);
    // const quizParticipationId = userParticipations.filter(elem => {
    //   elem ===
    // })
    const match: number = e.target.className.match(/\w+(\d)/)[1];
    if (match) {
      const participationAnswer = {
        AnswerId: currentAnswers[match - 1].id,
        ParticipationId: 'hi',
      };
      console.log(participationAnswer);
    }
  }
  return (
    <>
      {currentQuestion && (
        <div className={style.question_container}>
          <p className={style.question_text}>{currentQuestion.questionText}</p>
          <div className={style.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <button
                key={index}
                className={`answer${index + 1}`}
                onClick={handleAnswerClick}
              >
                {answer.answerText}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
