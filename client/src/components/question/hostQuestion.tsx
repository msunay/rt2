import {
  useState,
  useEffect,
} from 'react';
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

export default function HostQuestion({
  currentQuestionNumber,
  setCurrentQuestionNumber,
  hidden,
  trigger,
  quizId,
}: {
  currentQuestionNumber: number;
  setCurrentQuestionNumber: React.Dispatch<React.SetStateAction<number>>;
  hidden: boolean;
  trigger: number;
  quizId: string;
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

  // useEffect(() => {
  //   if (trigger > 0) createHandle();
  // }, [trigger]);

  useEffect(() => {
    console.log('UserID: ', userId);
  }, [userId]);

  useEffect(() => {
    userApiService
      .getUserParticipations(userId)
      .then((participationArr) => {
        console.log('participationArr: ', participationArr);
        const currentParticipation = participationArr.filter(
          (elem) => elem.QuizId === quizId
        )[0];
        setUserParticipation(currentParticipation);
        return currentParticipation;
      })
      .then((currentParticipation) => {
        console.log('CURRENT PARTICIPATION::', currentParticipation);
        userApiService
          .getOneQuizQuestionAnswer(currentParticipation.QuizId!)
          .then((data) => {
            setQuiz(data);
          })
          .catch((e) => console.error(e));
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
  }, [quiz, trigger]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);


  return (
    <>
      {currentQuestion && !hidden && (
        <div className={style.question_container}>
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
    </>
  );
}
