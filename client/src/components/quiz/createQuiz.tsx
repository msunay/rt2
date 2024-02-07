import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { date, object, string } from 'yup';
import {
  Controller,
  useController,
  useForm,
  useFormState,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAddDemoQuizMutation } from '@/services/backendApi';
import { useAppSelector } from '@/utils/hooks';

export default function CreateQuiz() {
  const [show, setShow] = useState(false);

  const [addQuiz, response] = useAddDemoQuizMutation();

  const id = useAppSelector((state) => state.userIdSlice.id)
  const showMode = () => {
    setShow(true);
  };

  let quizSchema = object().shape({
    quizName: string().required('Please fill in field'),
    category: string().required('Please fill in field'),
    startTime: date()
      .required()
      .default(() => new Date(Date.now() + 120000))
      .min(new Date(Date.now()), 'please set a future time'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(quizSchema),
    defaultValues: {
      quizName: '',
      category: 'architecture',
      startTime: new Date(Date.now() + 120000),
    },
  });

  const createQuiz = ({
    quizName,
    category,
    startTime
  }: {
    quizName: string;
    category: string;
    startTime: Date;
  }) => {
    console.log('ID: ', id);
    addQuiz({
      quizName,
      category,
      startTime,
      ownerId: id
    }).then(quiz => console.log('Create Quiz Response: ', quiz));
  };

  const btnPressStyle = ({ pressed }: { pressed: boolean }) => [
    {
      backgroundColor: pressed ? '#ffb296' : '#FF7F50',
    },
    styles.loginBtn,
  ];

  return (
    <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <View style={styles.form}>
        <Text>Quiz Name</Text>
        <Controller
          name="quizName"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder="..."
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.quizName && (
          <Text style={styles.validationError}>{errors.quizName.message}</Text>
        )}
        <Text>Catagory</Text>
        <Controller
          name="category"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              onBlur={onBlur}
              placeholder="choose a category..."
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode="dropdown"
            >
              <Picker.Item label="Architecture" value="architecture" />
              <Picker.Item label="Environment" value="environment" />
              <Picker.Item label="Food" value="food" />
              <Picker.Item label="General Knowledge" value="general-knowledge" />
              <Picker.Item label="Geography" value="geography" />
              <Picker.Item label="History" value="history" />
              <Picker.Item label="Music" value="music" />
              <Picker.Item label="Nature" value="nature" />
              <Picker.Item label="Science" value="science" />
              <Picker.Item label="Tech" value="tech" />
            </Picker>
          )}
        />
        {errors.category && (
          <Text style={styles.validationError}>{errors.category.message}</Text>
        )}
        {/* <Text>selected: {date.toLocaleString()}</Text> */}
        <Controller
          name="startTime"
          control={control}
          render={({ field: { value } }) => (
            <DateTimePicker
              testID="dateTimePicker"
              value={value}
              mode="datetime"
              onChange={(_, date) => {
                setValue('startTime', date!, { shouldValidate: true });
              }}
            />
          )}
        />
        {errors.startTime && (
          <Text style={styles.validationError}>{errors.startTime.message}</Text>
        )}
        {/* {show && (

        )} */}
        <Pressable style={btnPressStyle} onPress={handleSubmit(createQuiz)}>
          <Text style={styles.btnText}>Create Quiz</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  form: {
    width: '90%',
    alignSelf: 'center',
  },
  textInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    // marginBottom: 10,
    borderRadius: 10,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  validationError: {
    fontFamily: 'Nunito-Light',
    color: 'red',
  },
  loginBtn: {
    justifyContent: 'center',
    alignContent: 'center',
    height: 50,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
  },
  picker: {
    // height: 40,
    // borderColor: '#FF0000',
    // borderWidth: 1
  },
  pickerItem: {
    height: 130,
    fontSize: 15,
  },
});
