import { useAppDispatch } from '@/utils/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { object, string } from 'yup';
import { addQuestionWithAnswers } from '@/features/quizCreationSlice';

export default function QuizContent() {
  const { qno } = useLocalSearchParams<{ qno: string }>();
  const questionNum = parseInt(qno!);

  const dispatch = useAppDispatch();

  let questionSchema = object().shape({
    questionText: string().required('Please fill in field'),
    answer1: string().required('Please fill in field'),
    answer2: string().required('Please fill in field'),
    answer3: string().required('Please fill in field'),
    answer4: string().required('Please fill in field'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(questionSchema),
    defaultValues: {
      questionText: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
    },
  });

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
        positionInQuiz: questionNum,
        Answers: [
          { answerText: answer1, isCorrect: true },
          { answerText: answer2, isCorrect: false },
          { answerText: answer3, isCorrect: false },
          { answerText: answer4, isCorrect: false },
        ],
      })
      );
  };

  if (questionNum === 11) {
    return (
      <View style={styles.background}>
        <Text>Quiz Submitted</Text>
      </View>
    )
  }

  return (
    <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <View style={styles.form}>
        <Text>{`Question ${questionNum}`}</Text>
        <Controller
          name="questionText"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
            style={styles.questionInput}
            placeholder="Write yout question here..."
              multiline
              autoCapitalize="sentences"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              />
              )}
        />
        {errors.questionText && (
          <Text style={styles.validationError}>
            {errors.questionText.message}
          </Text>
        )}
        <Controller
          name="answer1"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.answerInput}
              placeholder="Write an answer here..."
              multiline
              autoCapitalize="sentences"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.answer1 && (
          <Text style={styles.validationError}>{errors.answer1.message}</Text>
        )}
        <Controller
          name="answer2"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.answerInput}
              placeholder="Write an answer here..."
              multiline
              autoCapitalize="sentences"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.answer2 && (
          <Text style={styles.validationError}>{errors.answer2.message}</Text>
        )}
        <Controller
          name="answer3"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.answerInput}
              placeholder="Write an answer here..."
              multiline
              autoCapitalize="sentences"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.answer3 && (
          <Text style={styles.validationError}>{errors.answer3.message}</Text>
        )}
        <Controller
          name="answer4"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.answerInput}
              placeholder="Write an answer here..."
              multiline
              autoCapitalize="sentences"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.answer4 && (
          <Text style={styles.validationError}>{errors.answer4.message}</Text>
        )}
      </View>
      <Link
          style={styles.loginBtn}
          href={{
            pathname: '/createQuiz/[qno]',
            params: { qno: questionNum + 1 },
          }}
          asChild
        >
          <Pressable onPress={handleSubmit(storeQuestion)}>
            <Text style={styles.btnText}>Next</Text>
          </Pressable>
        </Link>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  form: {flex: 1},
  questionInput: {},
  answerInput: {},
  loginBtn: {},
  validationError: {},
  btnText: {},
});
