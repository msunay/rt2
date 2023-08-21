import { useState, useEffect, useRef, LegacyRef, useImperativeHandle } from 'react';
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
  hidden,
  trigger
}: {
  currentQuestionNumber: number;
  setCurrentQuestionNumber: React.Dispatch<React.SetStateAction<number>>;
  hidden: boolean;
  trigger: number;
}) {

  const [userParticipationAnswer, setUserParticipationAnswer] = useState<ParticipationAnswer>({} as ParticipationAnswer);
  // useImperativeHandle(createParticipationAnswer, createHandle, [userParticipationAnswer])

  const userId = useAppSelector((state) => state.userIdSlice.value);
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

  useEffect(() => {
    if (trigger > 0) createHandle();
  }, [trigger]);

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
          console.log('participationArr: ', participationArr);
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
    console.log('userParticipation: ', userParticipation);
    if (match) {
      setUserParticipationAnswer({
        AnswerId: currentAnswers[match - 1].id,
        ParticipationId: userParticipation.id,
      } as ParticipationAnswer);
      console.log('userParticionAnswer: ', userParticipationAnswer);
      // dispatch(setUserParticipationAnswer(userParticipationAnswer))
    }
  }

  function createHandle () {
    console.log('userParticipationAnswer2: ', userParticipationAnswer);
    userApiService.createParticipationAnswer(userParticipationAnswer)
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
