import { StyleSheet, Text, View } from 'react-native'
import { AdvancedImage } from 'cloudinary-react-native';
import {Cloudinary} from '@cloudinary/url-gen';

const myCld = new Cloudinary({
  cloud: {
    cloudName: "rt2",
  },
});

let logo = myCld.image('rt2/images/wwhur1ze4imvqw4bveso')
// logo.resize()
export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        <AdvancedImage cldImg={logo} style={styles.logo}/>
        <Text >RT2</Text>
      </View>
      <Text style={styles.greeting}>Hello Bob</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  greeting: {
    flex: 1,
    textAlign: 'center'
  },
  logoContainer: {
    flexDirection: 'row',
    position: 'absolute',
    height: '100%',
    alignItems: 'center'

  },
  logo: {
    // borderColor: '#FF0000',
    // borderWidth: 1,
    height: '100%',
    width: 60,
    // top: -30
  }
})