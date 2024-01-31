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
import { useState } from 'react';
import { router } from 'expo-router';
import { useSession } from '@/services/authctx';
import { object, string } from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export default function LoginScreen() {
  const [registering, setRegistering] = useState(false);

  const { signIn } = useSession();

  let loginSchema = object().shape({
    username: string().required('Please enter username'),
    password: string().required('Please enter password'),
  });

  const {
    control: loginControl,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onLogin = (formData: any) => {
    signIn({
      username: formData.username,
      password: formData.password,
    }).then(() => {
      router.replace('/');
    });
  };

  let registrationSchema = object({
    email: string()
      .email('Not a valid email address')
      .required('Email is required'),
    username: string().required('Username is required'),
    password: string()
      .min(8, 'Password must contain at least 8 characters')
      .required('Password is required'),
    repeatPassword: string().required(),
  });

  const {
    control: registrationControl,
    handleSubmit: registrationHandleSubmit,
    formState: { errors: registrationErrors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      repeatPassword: '',
    },
  });

  const onRegister = (formData: any) => {
    // register logic
  }

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
      {!registering ? (
        <View style={styles.form}>
          <Controller
            control={loginControl}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder="Username"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="username"
          />
          {loginErrors.username && (
            <Text style={styles.validationError}>
              {loginErrors.username.message}
            </Text>
          )}
          <Controller
            control={loginControl}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="password"
          />
          {loginErrors.password && (
            <Text style={styles.validationError}>
              {loginErrors.password.message}
            </Text>
          )}
          <Pressable
            style={btnPressStyle}
            onPress={loginHandleSubmit(onLogin)}
          >
            <Text style={styles.btnText}>Sign In</Text>
          </Pressable>
          <Button
            title="Don't have an account yet?"
            onPress={() => {
              setRegistering(true);
            }}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <Controller
            control={registrationControl}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="email"
          />
          {registrationErrors.email && (
            <Text style={styles.validationError}>
              {registrationErrors.email.message}
            </Text>
          )}
          <Controller
            control={registrationControl}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder="Username"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="username"
          />
          {registrationErrors.username && (
            <Text style={styles.validationError}>
              {registrationErrors.username.message}
            </Text>
          )}
          <Controller
            control={registrationControl}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="password"
          />
          {registrationErrors.password && (
            <Text style={styles.validationError}>
              {registrationErrors.password.message}
            </Text>
          )}
          <Controller
            control={registrationControl}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder="Repeat Password"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="repeatPassword"
          />
          {registrationErrors.repeatPassword && (
            <Text style={styles.validationError}>
              {registrationErrors.repeatPassword.message}
            </Text>
          )}
          <Pressable
            style={btnPressStyle}
            onPress={registrationHandleSubmit(onRegister)}
          >
            <Text style={styles.btnText}>Register</Text>
          </Pressable>
          <Button
            title="Already have an account?"
            onPress={() => {
              setRegistering(false);
            }}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
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
