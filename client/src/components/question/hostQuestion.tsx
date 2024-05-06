import { useAppSelector } from '@/hooks/reduxHooks';
import { useGetOneQuizQuestionAnswerQuery } from '@/services/backendApi';
import type { Answer, QuestionAnswer } from '@/types/Types';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Animated from 'react-native-reanimated';

interface Props {
  hidden: boolean;
  trigger: number;
  quizId: string;
}

export default function HostQuestion({ hidden, trigger, quizId }: Props) {
  // Fetch quiz by its ID, including questions and answers.
  const { data: quiz } = useGetOneQuizQuestionAnswerQuery(quizId);

  // Access the current question number from the Redux state.
  const currentQuestionNumber = useAppSelector(state => state.questionSlice.value);

  // State to hold the current question object.
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer,
  );
  // State to hold the answers of the current question.
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  // Effect hook to set the current question based on the quiz data and the current question number.
  useEffect(() => {
    if (quiz) {
      // Find the question in the quiz data that matches the current question number.
      const foundQuestion = quiz.Questions.find(
        question => question.positionInQuiz === currentQuestionNumber,
      );

      if (foundQuestion) {
        setCurrentQuestion(foundQuestion);
      }
    }
  }, [quiz, currentQuestionNumber]);

  // Effect hook to update the current answers state when the current question changes.
  useEffect(() => {
    if (currentQuestion.Answers) {
      // Set the current answers to the answers of the current question.
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  return (
    <View style={styles.question_component}>
      {currentQuestion && !hidden && (
        <View style={styles.host_question_container}>
          <View style={styles.questionTextContainer}>
            <Text style={styles.question_text}>{currentQuestion.questionText}</Text>
          </View>
          <View style={styles.answer_container}>
            {currentAnswers?.map(answer => (
              <Pressable key={answer.id} style={styles.answerBtn}>
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
  host_question_container: {
    flex: 1,
    alignItems: 'center',
  },
  questionTextContainer: {
    flex: 1,
  },
  question_text: {
    flex: 1,
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    textAlign: 'center',
  },
  answer_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignContent: 'space-between',
  },
  answerText: {
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  answerBtn: {
    justifyContent: 'center',
    width: '50%',
    height: '50%',
    backgroundColor: 'grey',
  },
});
