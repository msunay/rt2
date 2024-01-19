import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/header';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../components/navbar';

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header />
      </View>
      <View style={styles.mainArea}>
        <View style={styles.discoverContainer}>
          <Text>Main Area</Text>
        </View>
      </View>
      <StatusBar style="auto" />
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
  },
  header: {
    borderColor: '#FF0000',
    borderWidth: 1,
    flex: 1,
    width: '100%',
  },
  mainArea: {
    flex: 11,
    width: '100%',
    // height: '100%',
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  discoverContainer: {},
});
