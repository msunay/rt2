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

interface Props {
  hidden: boolean;
  trigger: number;
  participation?: Participation;
}

export default function PlayerQuestion({
  hidden,
  trigger,
  participation,
}: Props) {
  // Fetch quiz details, including questions and answers, for a given participation's QuizId.
  const {
    data: quiz,
    error,
    isLoading,
  } = useGetOneQuizQuestionAnswerQuery(participation!.QuizId!);

  // RTK Query mutation hook for creating a participation answer.
  const [createParticipationAnswer, result] =
    useCreateParticipationAnswerMutation();

  // State to manage the user's selected answer for a quiz participation.
  const [userParticipationAnswer, setUserParticipationAnswer] =
    useState<ParticipationAnswer>({} as ParticipationAnswer);

  // State for the current question being displayed.
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );

  // State for the answers related to the current question.
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  // Effect hook to call `createHandle` when `trigger` changes and is greater than 0.
  useEffect(() => {
    if (trigger > 0) createHandle();
  }, [trigger]);

  // Effect hook to set the current question based on the quiz data and the current trigger value.
  useEffect(() => {
    if (!error && !isLoading && quiz) {
      setCurrentQuestion(
        quiz.Questions.find(
          (question) => question.positionInQuiz === trigger + 1
        )!
      );
    }
  }, [quiz, trigger]);

  // Effect hook to update the current answers whenever the current question changes.
  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  // Updates the state with the selected answer's ID and the participation ID.
  async function handleAnswerClick(index: number) {
    setUserParticipationAnswer({
      AnswerId: currentAnswers[index].id!,
      ParticipationId: participation!.id!,
    });
  }

  // Function to handle creating a participation answer.
  // calls the mutation to create a participation answer, and resets the userParticipationAnswer state.
  function createHandle() {
    console.log('userParticipationAnswer2: ', userParticipationAnswer);
    createParticipationAnswer(userParticipationAnswer);
    setUserParticipationAnswer({} as ParticipationAnswer); // Reset after submission.
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
