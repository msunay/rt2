import { useState, useEffect } from 'react';
import { QuestionAnswer, Answer } from '@/types/Types';
import { useAppSelector } from '@/utils/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGetOneQuizQuestionAnswerQuery } from '@/services/backendApi';
import { btnPressStyle } from '@/utils/helpers';

interface Props {
  hidden: boolean;
  trigger: number;
  quizId: string;
}

export default function HostQuestion({
  hidden,
  trigger,
  quizId,
}: Props) {
  // Fetch quiz by its ID, including questions and answers.
  const {
    data: quiz,
    error,
    isLoading,
  } = useGetOneQuizQuestionAnswerQuery(quizId);

  // Access the current question number from the Redux state.
  const currentQuestionNumber = useAppSelector(
    (state) => state.questionSlice.value
  );

  // State to hold the current question object.
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );
  // State to hold the answers of the current question.
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  // Effect hook to set the current question based on the quiz data and the current question number.
  useEffect(() => {
    if (quiz) {
      // Find the question in the quiz data that matches the current question number.
      setCurrentQuestion(
        quiz.Questions.find(
          (question) => question.positionInQuiz === currentQuestionNumber
        )!
      );
    }
  }, [quiz, currentQuestionNumber]);

  // Effect hook to update the current answers state when the current question changes.
  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
      // Set the current answers to the answers of the current question.
      setCurrentAnswers(currentQuestion.Answers);
    }
  }, [currentQuestion]);

  return (
    <View style={styles.question_component}>
      {currentQuestion && !hidden && (
        <View style={styles.host_question_container}>
          <View style={styles.questionTextContainer}>
            <Text style={styles.question_text}>
              {currentQuestion.questionText}
            </Text>
          </View>
          <View style={styles.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <Pressable
                key={index}
                style={({ pressed }) =>
                  btnPressStyle(pressed, ['silver', 'grey'], styles.answerBtn)
                }
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
  host_question_container: {
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
