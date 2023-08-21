import {
  useState,
  useEffect,
  useRef,
  LegacyRef,
  useImperativeHandle,
} from 'react';
import {
  QuestionAnswer,
  QuizQuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from '@/Types/Types';
import { userApiService } from '@/redux/services/apiService';
import style from './question.module.css';
import { setUserParticipationAnswer } from '@/redux/features/userParticipationAnswerSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export default function PlayerQuestion({
  currentQuestionNumber,
  setCurrentQuestionNumber,
  hidden,
  trigger,
  partId,
}: {
  currentQuestionNumber: number;
  setCurrentQuestionNumber: React.Dispatch<React.SetStateAction<number>>;
  hidden: boolean;
  trigger: number;
  partId: string;
}) {
  const [userParticipationAnswer, setUserParticipationAnswer] =
    useState<ParticipationAnswer>({} as ParticipationAnswer);

  const userId = useAppSelector((state) => state.userIdSlice.value);

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

  useEffect(() => {
    if (trigger > 0) createHandle();
  }, [trigger]);

  useEffect(() => {
    userApiService
      .getOneParticipation(partId)
      .then((data) => setUserParticipation(data));
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

  async function handleAnswerClick(e: any) {
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
  }

  return (
    <>
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
    </>
  );
}
