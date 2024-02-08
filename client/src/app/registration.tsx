import {
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSession } from '@/utils/authctx';
import { object, ref, string } from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResponseUser, UserPost } from '@/types/Types';
import { useAppDispatch } from '@/utils/hooks';
import { setUserId } from '@/features/userIdSlice';

export default function RegistrationScreen() {
  const dispatch = useAppDispatch();

  const { register } = useSession();

  let registrationSchema = object().shape({
    email: string()
      .email('Not a valid email address')
      .required('Email is required'),
    username: string()
      .min(5, 'Username must contain at least 5 characters')
      .required('Username is required'),
    password: string()
      .min(8, 'Password must contain at least 8 characters')
      .required('Password is required'),
    repeatPassword: string()
      .oneOf([ref('password')], 'Passwords must match')
      .required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      repeatPassword: '',
    },
  });

  const onRegister = (formData: UserPost) => {
    register!({
      email: formData.email,
      username: formData.username,
      password: formData.password,
    }).then((res: any) => {
      console.log('res: ', res);
      const responseUser: ResponseUser = {
        token: res.token,
        id: res.dataValues.id,
        username: res.dataValues.username,
      };
      dispatch(setUserId(responseUser));
      router.replace('/');
    });
  };

  const btnPressStyle = ({ pressed }: { pressed: boolean }) => [
    {
      backgroundColor: pressed ? '#ffb296' : '#FF7F50',
    },
    styles.loginBtn,
  ];

  return (
    <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/splash.png')}
          contentFit="contain"
          style={styles.image}
        />
      </View>
      <View style={styles.form}>
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.validationError}>{errors.email.message}</Text>
        )}
        <Controller
          name="username"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.username && (
          <Text style={styles.validationError}>{errors.username.message}</Text>
        )}
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.validationError}>{errors.password.message}</Text>
        )}
        <Controller
          name="repeatPassword"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder="Repeat Password"
              secureTextEntry
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.repeatPassword && (
          <Text style={styles.validationError}>
            {errors.repeatPassword.message}
          </Text>
        )}
        <Pressable style={btnPressStyle} onPress={handleSubmit(onRegister)}>
          <Text style={styles.btnText}>Register</Text>
        </Pressable>
        <Button
          title="Already have an account?"
          onPress={() => {
            router.replace('/login');
          }}
        />
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
  imageContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
  },
  image: {
    flex: 1,
    opacity: 0.4,
  },
  form: {
    width: '90%',
    alignSelf: 'center',
  },
  textInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
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
});
