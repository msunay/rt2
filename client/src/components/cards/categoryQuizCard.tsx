import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_IMAGES } from '@/utils/images';
import { CATEGORIES } from '@/utils/consts';
import { Image } from 'expo-image';

export default function CategoryQuizCard({ category }: { category: string }) {
  return (
    <View key={category} style={styles.categoryCardContainer}>
      <View style={styles.categoryCard}>
        <Image
          style={styles.images}
          source={CATEGORY_IMAGES[category]}
          contentFit="cover"
        />
        <Text style={styles.cardText}>{CATEGORIES[category]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryCardContainer: {
    // flex: 1,
    // width: 290,
    // height: '70%',
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    // maxWidth:
    // marginRight: 8,
    // borderColor: '#FF0000',
    // borderWidth: 1
    height: 110,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',

    margin: 10,
    width: 90
  },
  cardText: {
    flex: 1,
    fontFamily: 'Nunito-Black',
    textAlign: 'center',
    // textAlignVertical: 'center',
    // fontSize: 5
    // overflow: 'hidden'
    // maxHeight: 25,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  images: {
    flex: 2,
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
});
