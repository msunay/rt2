import { useState, useEffect, useRef } from "react";
import {
  QuestionAnswer,
  Answer,
  Participation,
  ParticipationAnswer,
} from "@/types/Types";
import { Pressable, StyleSheet, StyleSheetProperties, Text, View } from "react-native";
import {
  useCreateParticipationAnswerMutation,
  useGetOneQuizQuestionAnswerQuery,
} from "@/services/backendApi";
import { btnPressStyle } from "@/utils/helpers";

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

  const answer1 = useRef(null)

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
  const [selectedBtn, setSelectedBtn] = useState(5);

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
    setSelectedBtn(index);
  }

  // Function to handle creating a participation answer.
  // calls the mutation to create a participation answer, and resets the userParticipationAnswer state.
  function createHandle() {
    console.log("userParticipationAnswer2: ", userParticipationAnswer);
    createParticipationAnswer(userParticipationAnswer);
    setUserParticipationAnswer({} as ParticipationAnswer); // Reset after submission.
  }

  const pressableStyle = ({pressed}: { pressed: boolean}) => {
    return pressed ? {
      ...styles.answerBtn,
      backgroundColor: "rgba(255, 127, 80, 0.5)"
    } : {
      ...styles.answerBtn,
      backgroundColor: "rgba(110, 110, 110, 0.5)"
    }
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
              <View style={styles.answerBtnContainer} key={index}>
                <Pressable
                  ref={answer1}
                  key={index}
                  style={pressableStyle}
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
    // borderWidth: 1,
    // borderColor: 'red',
  },
  questionTextContainer: {
    justifyContent: "center",
    marginTop: 60,
    // borderWidth: 1,
    // borderColor: "red",
    // flex: 1,
  },
  question_text: {
    // color: 'white',
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Nunito-Black",
  },
  answer_container: {
    // flex: 3,
    height: 250,
    // display:
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
    // justifyContent: "space-evenly",
    // alignContent: "space-between",
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // borderWidth: 1,
    // borderColor: "black",
  },
  answerText: {
    fontFamily: "Nunito-Bold",
    textAlign: "center",
    fontSize: 16,
    // fontWeight: '900',
    // color: 'white',
  },
  answerBtnContainer: {
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
    width: "50%",
    height: "50%",
    // backgroundColor: 'none',
    // borderWidth: 2,
    // borderColor: 'red',
  },
  answerBtn: {
    // backgroundColor: "rgba(110, 110, 110, 0.5)",
    flex: 0.7,
    width: 160,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 2.5,
  },
});
