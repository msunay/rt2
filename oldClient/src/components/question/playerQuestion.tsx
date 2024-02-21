'use client';
import { useState, useEffect } from 'react';
import {
  QuestionAnswer,
  QuizQuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';
import style from '@/styles/question.module.css';
import { useAppSelector } from '@/redux/hooks';

export default function PlayerQuestion({
  hidden,
  trigger,
  partId,
}: {
  hidden: boolean;
  trigger: number;
  partId: string;
}) {
  const [userParticipationAnswer, setUserParticipationAnswer] =
    useState<ParticipationAnswer>({} as ParticipationAnswer);

  // LOGIC FOR HOSTING THE QUIZ
  const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
    {} as QuizQuestionAnswer
  );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [userParticipation, setUserParticipation] = useState<Participation>(
    {} as Participation
  );

  useEffect(() => {
    if (trigger > 0) createHandle();
  }, [trigger]);

  useEffect(() => {
    userApiService
      .getOneParticipationByPartId(partId)
      .then((newParticipation) => {
        setUserParticipation(newParticipation);
        return newParticipation;
      })
      .then((newParticipation) => {
        userApiService
          .getOneQuizQuestionAnswer(newParticipation.QuizId!)
          .then((newQuiz) => setQuiz(newQuiz));
      });
  }, []);

  useEffect(() => {
    if (quiz.Questions) {
      setCurrentQuestion(
        quiz.Questions.find(
          (question) => question.positionInQuiz === trigger + 1
        )!
      );
    }
  }, [quiz, trigger]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  async function handleAnswerClick(e: any) {
    document
      .querySelectorAll('button[name="a"]')
      //@ts-ignore
      .forEach((btn) => btn.classList.remove('active'));
    e.target.classList.add('active');
    const match: number = e.target.className.match(/\w+(\d)/)[1];
    if (match) {
      setUserParticipationAnswer({
        AnswerId: currentAnswers[match - 1].id,
        ParticipationId: userParticipation.id,
      } as ParticipationAnswer);
    }
  }

  function createHandle() {
    console.log('userParticipationAnswer2: ', userParticipationAnswer);
    userApiService.createParticipationAnswer(userParticipationAnswer);
    setUserParticipationAnswer({} as ParticipationAnswer);
  }

  return (
    <div className={style.question_component}>
      {currentQuestion && !hidden && (
        <div className={style.question_container}>
          <p className={style.question_text}>{currentQuestion.questionText}</p>
          <div className={style.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <button
                name="a"
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
    </div>
  );
}