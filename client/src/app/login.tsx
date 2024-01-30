import {
  Alert,
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

export default function LoginScreen() {
  const [registering, setRegistering] = useState(false)

  const [loginForm, setLoginForm] = useState({username: '', password: ''})
  const [registrationForm, setRegistrationForm] = useState({email: '', username: '', password: '', repeatPassword: ''})

  const { signIn } = useSession();

  const btnPressStyle = ({ pressed }: { pressed: boolean}) => [
    {
      backgroundColor: pressed ? '#ffb296' : '#FF7F50',
    },
    styles.loginBtn,
  ]

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
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            autoCapitalize="none"
            value={loginForm.username}
            onChangeText={(username) => setLoginForm((prev) => ({...prev, username}))}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            value={loginForm.password}
            onChangeText={(password) => setLoginForm((prev) => ({...prev, password}))}
          />
          <Pressable
            style={btnPressStyle}
            onPress={() => {
              if (loginForm.username && loginForm.password) {
                signIn({ username: loginForm.username, password: loginForm.password }).then(() => {
                  router.replace('/');
                });
              } else {
                Alert.alert('Please enter your details to sign-in');
              }
            }}
          >
            <Text style={styles.btnText}>Sign In</Text>
          </Pressable>
          <Button title="Register" onPress={() => {setRegistering(true)}} />
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType='email-address'
            value={registrationForm.email}
            onChangeText={(email) => setRegistrationForm((prev) => ({...prev, email}))}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            autoCapitalize="none"
            value={registrationForm.username}
            onChangeText={(username) => setRegistrationForm((prev) => ({...prev, username}))}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            value={registrationForm.password}
            onChangeText={(password) => setRegistrationForm((prev) => ({...prev, password}))}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Repeat Password"
            secureTextEntry
            autoCapitalize="none"
            value={registrationForm.repeatPassword}
            onChangeText={(repeatPassword) => setRegistrationForm((prev) => ({...prev, repeatPassword}))}
          />
          <Pressable
            style={btnPressStyle}
            onPress={() => Alert.alert('Use Yup for validation')}
          >
            <Text style={styles.btnText}>Register</Text>
          </Pressable>
          <Button title="Sign-In" onPress={() => {setRegistering(false)}} />
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
  },
  password: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    fontSize: 16,
    paddingLeft: 15,
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
  },
});
