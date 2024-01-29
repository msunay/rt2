import { StyleSheet, Text, View } from 'react-native'
import { AdvancedImage } from 'cloudinary-react-native';
import { Cloudinary } from '@cloudinary/url-gen';
import { useFonts, Nunito_700Bold } from '@expo-google-fonts/nunito';


const myCld = new Cloudinary({
  cloud: {
    cloudName: "rt2",
  },
});

let logo = myCld.image('rt2/images/wwhur1ze4imvqw4bveso');

export default function Header() {

  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold
  });

  //NOTE change font loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <AdvancedImage cldImg={logo} style={styles.logo}/>
          <Text style={styles.h1}>RT2</Text>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello</Text>
          <Text style={styles.name}>Bob Syor Ancl!</Text>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  logoContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  logo: {
    height: '100%',
    width: 30,
  },
  h1: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16
  },
  greetingContainer: {
    justifyContent: 'center',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  greeting: {
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    color: '#FF7F50',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
})