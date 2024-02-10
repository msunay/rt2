import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { CATEGORY_IMAGES } from '@/utils/images';

export default function HomeDiscover() {
  const { data, error, isLoading } = useGetAllQuizzesQuery();

  return (
    <View style={styles.container}>
      <View style={styles.discoverTitleLine}>
        <Text style={styles.h1}>Discover</Text>
        <View>
          <Text style={styles.h2}>View All {'->'}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {error ? (
          <Text>Oh no, there was an error</Text>
        ) : isLoading ? (
          <Text>Loading...</Text>
        ) : data ? (
          data.map((quiz: Quiz) => (
            <View key={quiz.id} style={styles.quizCardContainer}>
              <View style={styles.quizCard}>
                <Image
                  style={styles.images}
                  source={CATEGORY_IMAGES.tech}
                  contentFit="contain"
                />
                <Text>{quiz.quizName}</Text>
                <Text>{quiz.category}</Text>
              </View>
            </View>
          ))
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '103.5%',
  },
  discoverTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  h1: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  h2: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#FF7F50',
  },
  quizCardContainer: {
    width: 190,
    height: '100%',
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
  cardContainer: {
    overflow: 'scroll',
    height: '60%',
    paddingVertical: 10,
    flexDirection: 'row',
  },
  images: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
  },
});
