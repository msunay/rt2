import { setUserId } from '@/features/userIdSlice';
import { useAppDispatch } from '@/hooks/reduxHooks';
import type { LoginCredentials } from '@/types/Types';
import { useSession } from '@/utils/authctx';
import { yupResolver } from '@hookform/resolvers/yup';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { object, string } from 'yup';

export default function LoginScreen() {
  const dispatch = useAppDispatch(); // Hook to dispatch actions to Redux store.

  const { signIn } = useSession(); // Custom hook to access signIn method for authentication.

  // Schema for login form validation using yup.
  const loginSchema = object().shape({
    username: string().required('Please enter username'),
    password: string().required('Please enter password'),
  });

  // Setup useForm hook with yupResolver for schema validation and default form values.
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Function to handle login form submission.
  const onLogin = (formData: LoginCredentials) => {
    if (signIn) {
      signIn({
        username: formData.username,
        password: formData.password,
      }).then(res => {
        dispatch(setUserId(res)); // Dispatch action to store user ID in Redux store.
        router.replace('/'); // Navigate to home screen upon successful login.
      });
    }
  };

  // Function to dynamically adjust Pressable component style based on press state.
  const pressableStyle = ({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.loginBtn,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.loginBtn,
          backgroundColor: '#FF7F50',
        };
  };

  return (
    <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/splash.png')}
          contentFit='contain'
          style={styles.image}
        />
      </View>
      <View style={styles.form}>
        <Controller
          name='username'
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder='Username'
              autoCapitalize='none'
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
          name='password'
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              placeholder='Password'
              secureTextEntry
              autoCapitalize='none'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.validationError}>{errors.password.message}</Text>
        )}
        <Pressable style={pressableStyle} onPress={handleSubmit(onLogin)}>
          <Text style={styles.btnText}>Sign In</Text>
        </Pressable>

        <Button
          title="Don't have an account yet?"
          onPress={() => {
            router.replace('/registration');
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
