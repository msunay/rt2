import {
  defaultPlayerQuestionState,
  playerQuestionStateReducer,
} from '@/reducers/playerQuestionStateReducer';
import {
  useCreateParticipationAnswerMutation,
  useGetOneQuizQuestionAnswerQuery,
} from '@/services/backendApi';
import { QUESTION_TIME } from '@/services/quizSocketService';
import type { Participation, ParticipationAnswer, QuizQuestionAnswer } from '@/types/Types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useEffect, useReducer } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Animated from 'react-native-reanimated';

interface Props {
  hidden: boolean;
  currentQuestionNumber: number;
  participation?: Participation;
  quiz: QuizQuestionAnswer | undefined;
  quizError: FetchBaseQueryError | SerializedError | undefined;
  quizIsLoading: boolean;
}

export default function PlayerQuestion({
  hidden,
  currentQuestionNumber,
  participation,
  quiz,
  quizError,
  quizIsLoading,
}: Props) {


  // RTK Query mutation hook for creating a participation answer.
  const [createParticipationAnswer, result] = useCreateParticipationAnswerMutation();

  const [state, dispatchState] = useReducer(
    playerQuestionStateReducer,
    defaultPlayerQuestionState,
  );

  // Effect hook to call `createHandle` when `trigger` changes and is greater than 0.
  useEffect(() => {
    if (currentQuestionNumber > 1) createHandle();
    dispatchState({ type: 'SET_PQ_SEL_BTN', payload: null });
  }, [currentQuestionNumber]);

  // Effect hook to set the current question based on the quiz data and the current trigger value.
  useEffect(() => {
    if (!quizError && !quizIsLoading && quiz) {
      const foundQuestion = quiz.Questions.find(
        question => question.positionInQuiz === currentQuestionNumber,
      );

      if (foundQuestion) {
        dispatchState({ type: 'SET_PQ_CURR_Q', payload: foundQuestion });
      }
    }
  }, [quiz, currentQuestionNumber, quizError, quizIsLoading]);

  // Effect hook to update the current answers whenever the current question changes.
  useEffect(() => {
    if (state.currentQuestion.Answers) {
      dispatchState({ type: 'SET_PQ_CURR_ANS', payload: state.currentQuestion.Answers });
    }
    // console.log('state.currentQuestionText: ', state.currentQuestion.questionText);
  }, [state.currentQuestion]);

  // Updates the state with the selected answer's ID and the participation ID.
  function handleAnswerClick(index: number) {
    if (state.currentAnswers[index].id && participation?.id) {
      const AnswerId = state.currentAnswers[index]?.id || '';
      const ParticipationId = participation.id;
      dispatchState({ type: 'SET_PQ_PART_ANS', payload: { AnswerId, ParticipationId } });
    }
  }

  // Function to handle creating a participation answer.
  // calls the mutation to create a participation answer, and resets the userParticipationAnswer state.
  function createHandle() {
    console.log('userParticipationAnswer2: ', state.userParticipationAnswer);
    createParticipationAnswer(state.userParticipationAnswer);
    dispatchState({ type: 'SET_PQ_PART_ANS', payload: {} as ParticipationAnswer });
  }

  const pressableStyle =
    (index: number) =>
    ({ pressed }: { pressed: boolean }) => ({
      ...styles.answerBtn,
      backgroundColor:
        index === state.selectedBtn
          ? 'rgba(255, 127, 80, 0.5)'
          : 'rgba(110, 110, 110, 0.5)',
      borderColor: pressed ? 'yellow' : 'black',
    });

  return (
    <View style={styles.question_component}>
      {state.currentQuestion && !hidden && (
        <View style={styles.question_container}>
          <View style={styles.questionTextContainer}>
            <Text style={styles.question_text}>{state.currentQuestion.questionText}</Text>
          </View>
          <View style={{ marginBottom: 'auto', marginTop: 10 }}>
            <CountdownCircleTimer
              isPlaying
              duration={QUESTION_TIME / 1000}
              colors={['#01aa04', '#ede100', '#ff7f00', '#A30000']}
              colorsTime={[7, 5, 2, 0]}
              size={130}
            >
              {({ remainingTime, color }) => (
                <Animated.Text style={{ ...styles.countdownNum, color }}>
                  {remainingTime}
                </Animated.Text>
              )}
            </CountdownCircleTimer>
          </View>
          <View style={styles.answer_container}>
            {state.currentAnswers?.map((answer, index) => (
              <View style={styles.answerBtnContainer} key={answer.answerText}>
                <Pressable
                  // key={index}
                  style={pressableStyle(index)}
                  onPress={() => handleAnswerClick(index)}
                >
                  <Text style={styles.answerText}>{answer.answerText}</Text>
                </Pressable>
              </View>
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
    justifyContent: 'space-between',
  },
  questionTextContainer: {
    justifyContent: 'center',
    marginTop: 60,
  },
  question_text: {
    textAlign: 'center',
    fontSize: 25,
    fontFamily: 'Nunito-Black',
  },
  countdownNum: {
    fontSize: 50,
    fontWeight: '500',
  },
  answer_container: {
    height: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  answerText: {
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
    fontSize: 16,
  },
  answerBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    height: '50%',
  },
  answerBtn: {
    flex: 0.7,
    width: 160,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 2.5,
  },
});
