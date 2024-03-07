import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  GestureResponderEvent,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { object, string } from "yup";
import {
  addQuestionWithAnswers,
  resetQuizStore,
} from "@/features/quizCreationSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefObject, useRef, useState } from "react";
import { useAddFullQuizMutation } from "@/services/backendApi";
import { btnPressStyle } from "@/utils/helpers";

export default function QuizContent() {
  // Retrieve the query parameter 'qno' (question number) from the URL.
  const { qno } = useLocalSearchParams<{ qno: string }>();
  // Convert the question number to an integer for internal logic.
  const questionNum = parseInt(qno!);

  // Use Redux's useDispatch hook for dispatching actions.
  const dispatch = useAppDispatch();
  // Retrieve the current state of the quiz creation from the Redux store.
  const quizState = useAppSelector((state) => state.quizCreationSlice);

  // Hook to call the mutation for submitting the full quiz.
  const [submitFullQuiz, { isSuccess }] = useAddFullQuizMutation();

  // Refs for input fields to manage focus.
  const ref_input1 = useRef<TextInput>(null);
  const ref_input2 = useRef<TextInput>(null);
  const ref_input3 = useRef<TextInput>(null);
  const ref_input4 = useRef<TextInput>(null);
  const ref_input5 = useRef<TextInput>(null);

  // Track current ref for next/previous btn
  const [currentRef, setCurrentRef] =
    useState<RefObject<TextInput>>(ref_input1);

  // Focus next input
  const focusNextInput = (currentRef: RefObject<TextInput>) => {
    switch (currentRef) {
      case ref_input1:
        ref_input2.current?.focus();
        break;
      case ref_input2:
        ref_input3.current?.focus();
        break;
      case ref_input3:
        ref_input4.current?.focus();
        break;
      case ref_input4:
        ref_input5.current?.focus();
        break;
      default:
        Keyboard.dismiss(); // Dismiss the keyboard if we're at the last input
    }
  };

  // Focus previous input
  const focusPreviousInput = (currentRef: RefObject<TextInput>) => {
    switch (currentRef) {
      // Similar implementation to focusNextInput but in reverse
      case ref_input5:
        ref_input4.current?.focus();
        break;
      case ref_input4:
        ref_input3.current?.focus();
        break;
      case ref_input3:
        ref_input2.current?.focus();
        break;
      case ref_input2:
        ref_input1.current?.focus();
        break;
      // Continue for other inputs
      default:
        Keyboard.dismiss();
    }
  };

  // Define a schema for question and answer validation using Yup.
  let questionSchema = object().shape({
    questionText: string().required("Please fill in field"), // Validation for question text.
    answer1: string().required("Please fill in field"), // Validation for answer 1 (correct answer).
    answer2: string().required("Please fill in field"), // Validation for answer 2.
    answer3: string().required("Please fill in field"), // Validation for answer 3.
    answer4: string().required("Please fill in field"), // Validation for answer 4.
  });

  // Setup useForm hook with yupResolver for schema validation and default form values.
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(questionSchema),
    defaultValues: {
      questionText: "",
      answer1: "",
      answer2: "",
      answer3: "",
      answer4: "",
    },
  });

  // Function to store the current question and its answers in the Redux store.
  const storeQuestion = ({
    questionText,
    answer1,
    answer2,
    answer3,
    answer4,
  }: {
    questionText: string;
    answer1: string;
    answer2: string;
    answer3: string;
    answer4: string;
  }) => {
    dispatch(
      addQuestionWithAnswers({
        questionText,
        positionInQuiz: questionNum, // Position of the question within the quiz.
        Answers: [
          { answerText: answer1, isCorrect: true }, // Mark the first answer as correct.
          { answerText: answer2, isCorrect: false },
          { answerText: answer3, isCorrect: false },
          { answerText: answer4, isCorrect: false },
        ],
      })
    );

    // Navigate to the next question in the quiz creation process.
    router.navigate({
      pathname: "/createQuiz/[qno]",
      params: { qno: questionNum + 1 },
    });
  };

  // Function to submit the entire quiz.
  const submitQuiz = (e: GestureResponderEvent) => {
    submitFullQuiz(quizState).then(() => {
      dispatch(resetQuizStore()); // Reset the quiz creation state in the store.
      router.navigate("/"); // Navigate to the home page after submission.
    });
  };

  const pressableStyle = ({ pressed }: { pressed: boolean }) =>
    btnPressStyle(pressed, ["#ffb296", "#FF7F50"], styles.loginBtn);

  // If 10 questions have been created show preview of whole quiz and submit button.
  if (questionNum === 11) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.background}>
        <ScrollView>
          <Text>{JSON.stringify(quizState, null, 2)}</Text>
        </ScrollView>
        <Pressable style={pressableStyle} onPress={submitQuiz}>
          <Text>Submit Quiz</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding">
        <Text style={styles.title}>{`Question ${questionNum}`}</Text>
        <View style={styles.form}>
          <View>
            <Text>Question</Text>
          </View>
          <Controller
            name="questionText"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                ref={ref_input1}
                style={styles.questionInput}
                placeholder="Write yout question here..."
                multiline
                autoCapitalize="sentences"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onFocus={() => setCurrentRef(ref_input1)}
                onSubmitEditing={() => focusNextInput(ref_input1)}
              />
            )}
          />
          {errors.questionText && (
            <Text style={styles.validationError}>
              {errors.questionText.message}
            </Text>
          )}
          <View>
            <Text>Correct Answer</Text>
          </View>
          <Controller
            name="answer1"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                ref={ref_input2}
                style={styles.answerInput}
                placeholder="Write an answer here..."
                multiline
                autoCapitalize="sentences"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onFocus={() => setCurrentRef(ref_input2)}
                onSubmitEditing={() => focusNextInput(ref_input2)}
              />
            )}
          />
          <View>
            <Text>Answer 2</Text>
          </View>
          <Controller
            name="answer2"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                ref={ref_input3}
                style={styles.answerInput}
                placeholder="Write an answer here..."
                multiline
                autoCapitalize="sentences"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onFocus={() => setCurrentRef(ref_input3)}
                onSubmitEditing={() => focusNextInput(ref_input3)}
              />
            )}
          />
          {errors.answer2 && (
            <Text style={styles.validationError}>{errors.answer2.message}</Text>
          )}
          <View>
            <Text>Answer 3</Text>
          </View>
          <Controller
            name="answer3"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                ref={ref_input4}
                style={styles.answerInput}
                placeholder="Write an answer here..."
                multiline
                autoCapitalize="sentences"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onFocus={() => setCurrentRef(ref_input4)}
                onSubmitEditing={() => focusNextInput(ref_input4)}
              />
            )}
          />
          {errors.answer3 && (
            <Text style={styles.validationError}>{errors.answer3.message}</Text>
          )}
          <View>
            <Text>Answer 4</Text>
          </View>
          <Controller
            name="answer4"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                ref={ref_input5}
                style={styles.answerInput}
                placeholder="Write an answer here..."
                multiline
                autoCapitalize="sentences"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onFocus={() => setCurrentRef(ref_input5)}
                onSubmitEditing={() => focusNextInput(ref_input5)}
              />
            )}
          />
          {errors.answer4 && (
            <Text style={styles.validationError}>{errors.answer4.message}</Text>
          )}
        </View>
        <Pressable style={pressableStyle} onPress={handleSubmit(storeQuestion)}>
          <Text style={styles.btnText}>Next</Text>
        </Pressable>
      </KeyboardAvoidingView>
        </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    // marginHorizontal: "3%",
    width: '100%'
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginHorizontal: "5%",
  },
  title: {
    fontFamily: "Nunito-Black",
    fontSize: 20,
  },
  form: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    width: "100%",
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  questionInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    marginBottom: 60,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: "Nunito-Regular",
    width: "100%",
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  answerInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: "Nunito-Regular",
    width: "100%",
  },
  loginBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#FF7F50",
    borderRadius: 10,
    marginTop: 10,

    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  validationError: {
    fontFamily: "Nunito-Light",
    color: "red",
  },
  btnText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Nunito-Bold",
  },
});
