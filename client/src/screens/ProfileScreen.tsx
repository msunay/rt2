import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { TILE_IMAGES } from '@/utils/images';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <Link
          href="/createQuiz"
          asChild
        >
          <Pressable style={styles.imageContainer}>
            <Image
              style={styles.image}
              contentFit="contain"
              source={TILE_IMAGES.createQuiz}
            />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginHorizontal: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  mainArea: {
    flex: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  image: {
    flex: 1,
  },
  imageContainer: {
    height: 150,
    width: '60%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});
