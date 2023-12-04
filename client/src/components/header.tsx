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
      <AdvancedImage cldImg={logo} style={styles.logo}/>
      <Text style={styles.greeting}>Hello Bob</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    // backgroundColor: '#000000',
    borderColor: '#FF0000',
    borderWidth: 1,
    width: '100%',
    height: 70,
    justifyContent: 'center'
  },
  greeting: {
    alignSelf: 'center'
  },
  logo: {
    borderColor: '#FF0000',
    borderWidth: 1,
    height: 50,

    // width: 100
  }
})