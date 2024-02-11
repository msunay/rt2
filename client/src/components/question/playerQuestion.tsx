import { useState, useEffect } from 'react';
import {
  QuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from '@/types/Types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useCreateParticipationAnswerMutation,
  useGetOneQuizQuestionAnswerQuery,
} from '@/services/backendApi';
import { btnPressStyle } from '@/utils/helpers';

export default function PlayerQuestion({
  hidden,
  trigger,
  participation,
}: {
  hidden: boolean;
  trigger: number;
  participation?: Participation;
}) {
  const {
    data: quiz,
    error,
    isLoading,
  } = useGetOneQuizQuestionAnswerQuery(participation!.QuizId!);

  const [createParticipationAnswer, result] =
    useCreateParticipationAnswerMutation();

  const [userParticipationAnswer, setUserParticipationAnswer] =
    useState<ParticipationAnswer>({} as ParticipationAnswer);

  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );

  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (trigger > 0) createHandle();
  }, [trigger]);

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

  async function handleAnswerClick(index: number) {
    setUserParticipationAnswer({
      AnswerId: currentAnswers[index].id!,
      ParticipationId: participation!.id!,
    });
  }

  function createHandle() {
    console.log('userParticipationAnswer2: ', userParticipationAnswer);
    createParticipationAnswer(userParticipationAnswer);
    setUserParticipationAnswer({} as ParticipationAnswer);
  }

  const pressableStyle = ({ pressed }: { pressed: boolean }) =>
    btnPressStyle(pressed, ['silver', 'grey'], styles.answerBtn);
    
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
                key={index}
                style={pressableStyle}
                onPress={() => handleAnswerClick(index)}
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
    flex: 1,
  },
  question_text: {
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
  },
});
