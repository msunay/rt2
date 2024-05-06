import { incrementQuestionNumber } from '@/features/questionSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { quizSocketService } from '@/services/quizSocketService';
import { QUESTION_TIME } from '@/services/quizSocketService';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import HostQuestion from '../question/hostQuestion';

export default function HostStream({ quizId }: { quizId: string }) {
  const currentQuestionNumber = useAppSelector(state => state.questionSlice.value);
  const dispatch = useAppDispatch();

  const [quizStarted, setQuizStarted] = useState(false);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const nextQBtn = useRef(null);
  const startBtn = useRef(null);

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.startTimerListener(setQuestionHidden);
    quizSocketService.revealAnswerHostListener(setQuestionHidden);
    quizSocketService.hostWinnersListener(setTrigger);
  }, []);

  function startQuiz() {
    setQuizStarted(true);
    quizSocketService.emitHostStartQuiz();
    dispatch(incrementQuestionNumber());
  }

  function nextQuestion() {
    setQuestionHidden(false);

    if (currentQuestionNumber < 9) {
      setTimeout(() => {}, QUESTION_TIME + 2000);
    }

    dispatch(incrementQuestionNumber());
    quizSocketService.emitNextQ();
    setTrigger(trigger => trigger + 1);
  }

  function handleWinners() {
    console.log('HANDLE WINNERS TRIGGER');
    quizSocketService.emitShowWinners();
  }

  const pressableStyle = ({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.next_q_btn,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.next_q_btn,
          backgroundColor: '#FF7F50',
        };
  };

  return (
    <View style={styles.unit}>
      <View style={styles.video_container}>
        <View style={styles.question_component_container}>
          {quizStarted && (
            <HostQuestion quizId={quizId} trigger={trigger} hidden={questionHidden} />
          )}
        </View>
      </View>

      <View style={styles.btn_holder}>
        <View style={styles.quiz_controls}>
          {quizStarted ? (
            currentQuestionNumber === 10 ? (
              <Pressable
                style={pressableStyle}
                onPress={() => {
                  handleWinners();
                  dispatch(incrementQuestionNumber());
                }}
              >
                <Text style={styles.next_q_btnText}>Reveal Winners</Text>
              </Pressable>
            ) : (
              <Pressable ref={nextQBtn} onPress={nextQuestion} style={pressableStyle}>
                <Text style={styles.next_q_btnText}>Next Question</Text>
              </Pressable>
            )
          ) : (
            <Pressable ref={startBtn} style={pressableStyle} onPress={startQuiz}>
              <Text style={styles.next_q_btnText}>Start Quiz</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  unit: {
    justifyContent: 'flex-end',
  },
  close_btn: {},
  count_down: {},
  video_container: {},
  video: {},
  question_component_container: {
    height: 170,
  },
  btn_join: {},
  btn_holder: {
    alignSelf: 'center',
  },
  quiz_controls: {},
  next_q_btn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  next_q_btnText: {
    fontFamily: 'Nunito-Bold',
  },
});
