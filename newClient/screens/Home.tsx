import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/header';
import PlayNextQuizBtn from '../components/playNextQuizBtn';

export default function Home() {

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header />
        </View>
        <View style={styles.mainArea}>
          <View style={styles.playNextQuizBtnContainer}>
            <PlayNextQuizBtn />
          </View>
          <View style={styles.discoverContainer}>

          </View>
          <View style={styles.catagoriesContainer}>

          </View>
        </View>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    fontFamily: 'Nunito_700Bold'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f9f8f8',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    borderColor: '#FF0000',
    borderWidth: 1,
    flex: 1,
    width: '100%',
  },
  mainArea: {
    flex: 10,
    width: '100%',
    // height: '100%',
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  playNextQuizBtnContainer: {
    flex: 1,
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  discoverContainer: {
    flex: 2.5,
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  catagoriesContainer: {
    flex: 1,
    borderColor: '#FF0000',
    borderWidth: 1,
    marginBottom: 40
  }
});
