import { StyleSheet, Text, View } from 'react-native'
import { AdvancedImage } from 'cloudinary-react-native';
import { Cloudinary } from '@cloudinary/url-gen';

const myCld = new Cloudinary({
  cloud: {
    cloudName: "rt2",
  },
});

let logo = myCld.image('rt2/images/wwhur1ze4imvqw4bveso')

export default function Header() {
  return (
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <AdvancedImage cldImg={logo} style={styles.logo}/>
          <Text >RT2</Text>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello Bob</Text>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  greeting: {
    flex: 1,
    textAlign: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    position: 'absolute',
    height: '100%',
    alignItems: 'center'

  },
  logo: {
    height: '100%',
    width: 60,
  }
})