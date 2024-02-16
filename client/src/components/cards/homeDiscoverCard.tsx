import { Quiz } from '@/types/Types'
import { CATEGORIES } from '@/utils/consts'
import { CATEGORY_IMAGES } from '@/utils/images'
import { Image } from 'expo-image'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeDiscoverCard({ quiz }: { quiz: Quiz }) {
  return (
    <View key={quiz.id} style={styles.quizCardContainer}>
      <View style={styles.quizCard}>
        <Image
          style={styles.images}
          source={CATEGORY_IMAGES[quiz.category]}
          contentFit="cover"
        />
        <Text style={styles.cardTextTitle}>{quiz.quizName}</Text>
        <Text style={styles.cardText}>{CATEGORIES[quiz.category]}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  quizCardContainer: {
    // flex: 1,
    // width: 290,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 8,
  },
  quizCard: {
    flex: 1,
    height: '100%',
    margin: 10,
  },
  cardTextTitle: {
    // flex: 1,
    fontFamily: 'Nunito-Black',
    // maxHeight: 25,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  cardText: {
    fontFamily: 'Nunito-Regular',
  },
  images: {
    // flex: 1,
    width: 170,
    height: 100,
    borderRadius: 10,
  },
})