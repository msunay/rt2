import { useState, useEffect } from 'react';
import { QuestionAnswer, Answer } from '@/types/Types';
import { useAppSelector } from '@/utils/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGetOneQuizQuestionAnswerQuery } from '@/services/backendApi';
import { btnPressStyle } from '@/utils/helpers';

export default function HostQuestion({
  hidden,
  trigger,
  quizId,
}: {
  hidden: boolean;
  trigger: number;
  quizId: string;
}) {
  const {
    data: quiz,
    error,
    isLoading,
  } = useGetOneQuizQuestionAnswerQuery(quizId);

  const currentQuestionNumber = useAppSelector(
    (state) => state.questionSlice.value
  );

  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (quiz) {
      setCurrentQuestion(
        quiz.Questions.find(
          (question) => question.positionInQuiz === currentQuestionNumber
        )!
      );
    }
  }, [quiz, trigger]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.Answers) {
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
