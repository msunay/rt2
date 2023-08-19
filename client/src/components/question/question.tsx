import { useState, useEffect, useRef, LegacyRef } from 'react';
import {
  QuestionAnswer,
  QuizQuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';
import style from './question.module.css';
import { Socket } from 'socket.io-client';
import { QuizClientToServerEvents, QuizServerToClientEvents } from '@/Types/QuizSocketTypes';
import { setUserParticipationAnswer } from '@/redux/features/userParticipationAnswerSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export default function Question({
  currentQuestionNumber,
  setCurrentQuestionNumber,
  host,
  hidden
}: {
  currentQuestionNumber: number;
  setCurrentQuestionNumber: React.Dispatch<React.SetStateAction<number>>;
  host: boolean;
  hidden: boolean;
}) {

  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.userIdSlice.value);
  // const dispatch = useAppDispatch();
  // LOGIC FOR HOSTING THE QUIZ
  const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
    {} as QuizQuestionAnswer
  );
  const [isHost, setIsHost] = useState<boolean>(true);

  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer | null>(
    null
    );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [userParticipation, setUserParticipation] = useState<Participation>(
    {} as Participation
    );

  let participationAnswer: ParticipationAnswer;

  useEffect(() => {
    console.log('UserID: ', userId);
  }, [userId]);

  useEffect(() => {


    userApiService
    .getOneQuizQuestionAnswer('98e03864-eec4-4800-941c-4b1dbe78301f')
    .then((data) => {
        setQuiz(data);
      })
    .catch(e => console.error(e))

  }, []);

  useEffect(() => {
    if (
      quiz.Questions &&
      quiz.Questions.length > 0 &&
      quiz.Questions[currentQuestionNumber].Answers
    ) {
      setCurrentQuestion(quiz.Questions[currentQuestionNumber]);
    }
    userApiService
      .getUserParticipations(userId)
      .then((participationArr) => {
          setUserParticipation(participationArr.filter((elem) => elem.QuizId === quiz.id)[0]);
        });

  }, [quiz, currentQuestionNumber]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  async function handleAnswerClick(e: any) {

    const match: number = e.target.className.match(/\w+(\d)/)[1];

    if (match) {
      participationAnswer = {
        AnswerId: currentAnswers[match - 1].id,
        ParticipationId: userParticipation.id,
      } as ParticipationAnswer;
      console.log(participationAnswer);
      dispatch(setUserParticipationAnswer(participationAnswer))
    }
  }

  return (
    <>
      {currentQuestion && !hidden && (
        <div className={style.question_container}>
          <p className={style.question_text}>{currentQuestion.questionText}</p>
          <div className={style.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <button
                name='a'
                key={index}
                className={`answer${index + 1}`}
                // className='a'
                onClick={handleAnswerClick}
                // ref={pushRef}
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
