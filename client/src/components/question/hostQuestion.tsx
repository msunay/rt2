import { useState, useEffect } from 'react';
import { QuestionAnswer, QuizQuestionAnswer, Answer } from '@/types/Types';
// import style from '@/styles/question.module.css';
import { useAppSelector } from '@/utils/hooks';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useGetOneQuizQuestionAnswerQuery } from '@/services/backendApi';

export default function HostQuestion({
  hidden,
  trigger,
  quizId,
}: {
  hidden: boolean;
  trigger: number;
  quizId: string;
}) {
  const currentQuestionNumber = useAppSelector(
    (state) => state.questionSlice.value
  );
  // const [quiz, setQuiz] = useState<QuizQuestionAnswer>(
  //   {} as QuizQuestionAnswer
  // );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionAnswer>(
    {} as QuestionAnswer
  );
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);


  const {
    data: quiz,
    error,
    isLoading,
  } = useGetOneQuizQuestionAnswerQuery(quizId);

  // useEffect(() => {
  //   userApiService.getOneQuizQuestionAnswer(quizId).then((data) => {
  //     setQuiz(data);
  //   });
  // }, []);

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
          <Text style={styles.question_text}>
            {currentQuestion.questionText}
          </Text>
          <View style={styles.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <Button
                title={answer.answerText}
                key={index}
                // style={`answer${index + 1}`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question_component: {},
  host_question_container: {},
  question_text: {},
  answer_container: {},
});
