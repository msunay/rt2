import { useState, useEffect, useRef } from "react";
import {
  QuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from "@/types/Types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  useCreateParticipationAnswerMutation,
  useGetOneQuizQuestionAnswerQuery,
} from "@/services/backendApi";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { QUESTION_TIME } from "@/services/quizSocketService";
import Animated from "react-native-reanimated";

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

  // State for the selected btn
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);

  // State for the answers related to the current question.
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);

  // Effect hook to call `createHandle` when `trigger` changes and is greater than 0.
  useEffect(() => {
    if (trigger > 0) createHandle();
    setSelectedBtn(null)
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
  function handleAnswerClick(index: number) {
    setUserParticipationAnswer({
      AnswerId: currentAnswers[index].id!,
      ParticipationId: participation!.id!,
    });
    setSelectedBtn(index);
  }

  // Function to handle creating a participation answer.
  // calls the mutation to create a participation answer, and resets the userParticipationAnswer state.
  function createHandle() {
    console.log("userParticipationAnswer2: ", userParticipationAnswer);
    createParticipationAnswer(userParticipationAnswer);
    setUserParticipationAnswer({} as ParticipationAnswer); // Reset after submission.
  }

  const pressableStyle = (index: number) => ({ pressed }: { pressed: boolean }) => ({
    ...styles.answerBtn,
    backgroundColor: index === selectedBtn
      ? "rgba(255, 127, 80, 0.5)"
      : "rgba(110, 110, 110, 0.5)",
    borderColor: pressed ? "yellow" : "black",
  });

  return (
    <View style={styles.question_component}>
      {currentQuestion && !hidden && (
        <View style={styles.question_container}>
          <View style={styles.questionTextContainer}>
            <Text style={styles.question_text}>
              {currentQuestion.questionText}
            </Text>
          </View>
          <View style={{marginBottom: 'auto', marginTop: 10}}>
            <CountdownCircleTimer
              isPlaying
              duration={QUESTION_TIME / 1000}
              colors={["#01aa04", "#ede100", "#ff7f00", "#A30000"]}
              colorsTime={[7, 5, 2, 0]}
              size={130}
            >
              {({ remainingTime, color }) => (
                  <Animated.Text
                    style={{ ...styles.countdownNum, color }}
                  >
                    {remainingTime}
                  </Animated.Text>
              )}
            </CountdownCircleTimer>
          </View>
          <View style={styles.answer_container}>
            {currentAnswers?.map((answer, index) => (
              <View style={styles.answerBtnContainer} key={index}>
                <Pressable
                  key={index}
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionTextContainer: {
    justifyContent: "center",
    marginTop: 60,
  },
  question_text: {
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Nunito-Black",
  },
  countdownNum: {
    fontSize: 50,
    fontWeight: "500",
  },
  answer_container: {
    height: 250,
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  answerText: {
    fontFamily: "Nunito-Bold",
    textAlign: "center",
    fontSize: 16,
  },
  answerBtnContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    height: "50%",
  },
  answerBtn: {
    flex: 0.7,
    width: 160,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 2.5,
  },
});
