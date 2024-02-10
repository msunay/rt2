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
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAddDemoQuizMutation } from '@/services/backendApi';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { CATEGORY_IMAGES } from '@/utils/images';
import { Image, ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { addQuizData } from '@/features/quizCreationSlice';

export default function CreateQuiz() {
  const [addQuiz] = useAddDemoQuizMutation();
  // const [setQuizDetails] =
  const dispatch = useAppDispatch();

  const [catagoryImage, setCatagoryImage] = useState<ImageSource>(
    CATEGORY_IMAGES['general-knowledge']
  );

  const id = useAppSelector((state) => state.userIdSlice.id);

  let quizSchema = object().shape({
    quizName: string().required('Please fill in field'),
    category: string().required('Please fill in field'),
    dateTime: date()
      .required()
      .default(() => new Date(Date.now() + 120000))
      .min(new Date(Date.now()), 'please set a future time'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(quizSchema),
    defaultValues: {
      quizName: '',
      category: 'architecture',
      dateTime: new Date(Date.now() + 120000),
    },
  });

  const watchCatagory = watch('category');

  useEffect(() => {
    setCatagoryImage(CATEGORY_IMAGES[watchCatagory]);
  }, [watchCatagory]);

  const createQuiz = ({
    quizName,
    category,
    dateTime,
  }: {
    quizName: string;
    category: string;
    dateTime: Date;
  }) => {
    addQuiz({
      quizName,
      category,
      startTime: dateTime,
      ownerId: id,
    }).then((quiz) => console.log('Create Quiz Response: ', quiz));
  };

  const storeQuizDetails = ({
    quizName,
    category,
    dateTime,
  }: {
    quizName: string;
    category: string;
    dateTime: Date;
  }) => {
    dispatch(addQuizData({ quizName, category, dateTime: dateTime.toISOString(), quizOwner: id }));
    router.navigate({
      pathname: '/createQuiz/[qno]',
      params: { qno: 1 },
    })
  };

  const btnPressStyle = ({ pressed }: { pressed: boolean }) => [
    {
      backgroundColor: pressed ? '#ffb296' : '#FF7F50',
    },
    styles.loginBtn,
  ];

  return (
    <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <Image
        source={catagoryImage}
        style={styles.categoryImage}
        contentFit="contain"
      />
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
              <Picker.Item
                label="General Knowledge"
                value="general-knowledge"
              />
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
        <Controller
          name="dateTime"
          control={control}
          render={({ field: { value } }) => (
            <DateTimePicker
              testID="dateTimePicker"
              value={value}
              mode="datetime"
              onChange={(_, date) => {
                setValue('dateTime', date!, { shouldValidate: true });
              }}
            />
          )}
        />
        {errors.dateTime && (
          <Text style={styles.validationError}>{errors.dateTime.message}</Text>
        )}
        <Pressable style={btnPressStyle} onPress={handleSubmit(createQuiz)}>
          <Text style={styles.btnText}>Create Demo Quiz</Text>
        </Pressable>
        <Pressable style={btnPressStyle} onPress={handleSubmit(storeQuizDetails)}>
          <Text style={styles.btnText}>Create Full Quiz</Text>
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
    flex: 1.6,
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
  categoryImage: {
    flex: 1,
  },
});
