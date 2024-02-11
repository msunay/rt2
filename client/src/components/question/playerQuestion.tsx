import { useState, useEffect } from 'react';
import {
  QuestionAnswer,
  QuizQuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from '@/types/Types';
// import { userApiService } from '@/redux/services/apiService';
// import style from '@/styles/question.module.css';
import { useAppSelector } from '@/utils/hooks';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useCreateParticipationAnswerMutation,
  useGetOneQuizQuestionAnswerQuery,
} from '@/services/backendApi';

export default function PlayerQuestion({
  hidden,
  trigger,
  // partId,
  participation,
}: {
  hidden: boolean;
  trigger: number;
  participation?: Participation;
  // partId: string;
}) {
  const [userParticipationAnswer, setUserParticipationAnswer] =
    useState<ParticipationAnswer>({} as ParticipationAnswer);

  // LOGIC FOR HOSTING THE QUIZ
  // const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
  //   {} as QuizQuestionAnswer
  // );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [userParticipation, setUserParticipation] = useState<Participation>(
    {} as Participation
  );

  const {
    data: quiz,
    error,
    isLoading,
  } = useGetOneQuizQuestionAnswerQuery(participation!.QuizId!);

  const [createParticipationAnswer, result] =
    useCreateParticipationAnswerMutation();

  useEffect(() => {
    if (trigger > 0) createHandle();
  }, [trigger]);

  // useEffect(() => {
  //   userApiService
  //     .getOneParticipationByPartId(partId)
  //     .then((newParticipation) => {
  //       setUserParticipation(newParticipation);
  //       return newParticipation;
  //     })
  //     .then((newParticipation) => {
  //       userApiService
  //         .getOneQuizQuestionAnswer(newParticipation.QuizId!)
  //         .then((newQuiz) => setQuiz(newQuiz));
  //     });
  // }, []);

  useEffect(() => {
    if (!error && !isLoading) {
      setCurrentQuestion(
        quiz!.Questions.find(
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
    // document
    //   .querySelectorAll('button[name="a"]')
    //   //@ts-ignore
    //   .forEach((btn) => btn.classList.remove('active'));
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
    createParticipationAnswer(userParticipationAnswer);
    setUserParticipationAnswer({} as ParticipationAnswer);
  }

  return (
    <View style={styles.question_component}>
      {currentQuestion && !hidden && (
        <View style={styles.question_container}>
          <View style={styles.questionTextContainer}>
            <Text style={styles.question_text}>
              {currentQuestion.questionText}
            </Text>
          </View>
          <View style={styles.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <Pressable
                // name="a"
                key={index}
                style={styles.answerBtn}
                // style={`answer${index + 1}`}
                onPress={handleAnswerClick}
              >
                <Text style={styles.answerText}>{answer.answerText}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question_component: {
    flex: 1,
  },
  question_container: {
    flex: 1,
    alignItems: 'center',
  },
  questionTextContainer: {
    flex: 1
  },
  question_text: {
    // flex: 1,
    fontFamily: 'Nunito-Black',
  },
  answer_container: {
    flex: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignContent: 'space-between',
  },
  answerText: {
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },
  answerBtn: {
    justifyContent: 'center',
    width: '50%',
    height: '50%',
    backgroundColor: 'grey',

  },
});
