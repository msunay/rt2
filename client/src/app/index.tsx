import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/header';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Navbar from '../components/navbar';

export default function App() {

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.mainArea} >
        <Text>Main Area</Text>
      </View>
      <Navbar />
      <StatusBar style="dark"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f9f8f8',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%'
  },
  mainArea: {
    width: '100%',
    height: '100%',
    borderColor: '#FF0000',
    borderWidth: 1
  },
});
