import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Quiz } from '@/types/Types';
import { Image } from 'expo-image';
import { CATEGORY_IMAGES } from '@/utils/images';
import {
  useGetOneParticipationQuery,
  useGetUserDetailsQuery,
} from '@/services/backendApi';
import { formatDistance } from 'date-fns';
import { useAppSelector } from '@/utils/hooks';
import { Link } from 'expo-router';

export default function ParticipationQuizCard({ quiz }: { quiz: Quiz }) {
  // Fetches the host's details for the quiz using the quiz owner's ID.
  const { data: host } = useGetUserDetailsQuery(quiz.quizOwner);

  // Retrieves the current user's ID from the Redux state.
  const id = useAppSelector((state) => state.userIdSlice.id);

  // Fetches participation details for the current user and the specific quiz.
  const { data: participation } = useGetOneParticipationQuery({
    userId: id,
    quizId: quiz.id!,
  });

  return (
    <Link
      href={{
        pathname: '/playQuiz/[partId]',
        params: { partId: participation?.id },
      }}
      asChild
    >
      <Pressable style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={CATEGORY_IMAGES[quiz.category]}
            style={styles.image}
            contentFit="cover"
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.quizName}>{quiz.quizName}</Text>
          <Text style={styles.category}>{quiz.category}</Text>
          <Text style={styles.category}>{host?.username}</Text>
          <Text style={styles.category}>
            {formatDistance(quiz.dateTime, Date.now(), { addSuffix: true })}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
  },
  imageContainer: {
    flex: 1,
    maxHeight: '85%',
    aspectRatio: 1.5,
    marginLeft: 10,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 10,
  },
  image: {
    flex: 1,
    borderRadius: 10,
  },
  category: {
    fontFamily: 'Nunito-Regular',
    fontSize: 10,
    flex: 1,
  },
  quizName: {
    fontFamily: 'Nunito-ExtraBold',
    alignSelf: 'flex-start',
  },
  detailsContainer: {
    flex: 1.7,
    marginLeft: 10,
    height: '85%',
  },
  addParticipation: {
    flex: 0.5,
  },
});
