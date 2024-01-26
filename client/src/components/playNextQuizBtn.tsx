import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useFonts, Nunito_700Bold, Nunito_400Regular } from '@expo-google-fonts/nunito';


export default function PlayNextQuizBtn() {

  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold,
    Nunito_400Regular
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.playNextQuizBtnBackground}>
      <View style={styles.textContainer}>
        <Text style={styles.h1Text}>Play Next Quiz!</Text>
      </View>
      <View style={styles.nextQuizDetails}>
        <Text style={styles.detailsText}>Quiz Name</Text>
        <Text style={styles.detailsText}>Quiz Catagory</Text>
        <Text style={styles.detailsText}>Quiz Start Time</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  playNextQuizBtnBackground: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    borderRadius: 17,
    backgroundColor: '#25CED1'
  },
  textContainer: {
    width: '40%',
    marginLeft: '5%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  h1Text: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Nunito_700Bold'
  },
  nextQuizDetails: {
    // flex: 1,
    height: '100%',
    justifyContent: 'space-around',
    width: '45%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  detailsText: {
    color: 'white',
    fontFamily: 'Nunito_400Regular',
  },
})