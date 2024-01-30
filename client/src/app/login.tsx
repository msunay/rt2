import {
  Alert,
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useSession();

  return (
    <Pressable style={styles.background} onPress={Keyboard.dismiss}>
      <View style={styles.imageContainer}>
        {/* <Image
          source={require('../../assets/splash.png')}
          contentFit="contain"
          style={styles.image}
        /> */}
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.textInput}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? '#ffb296' : '#FF7F50',
            },
            styles.loginBtn,
          ]}
          onPress={() => {
            if (username && password) {
              signIn({ username, password }).then(() => {
                router.replace('/');
              })
            } else {
              Alert.alert('Please enter your details to sign-in');
            }
          }}
        >
          <Text style={styles.btnText}>Sign In</Text>
        </Pressable>
      </View>
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
    backgroundColor: 'blue',
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
