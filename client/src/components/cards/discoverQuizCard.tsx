import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Quiz } from '@/types/Types';
import { Image } from 'expo-image';
import { CATEGORY_IMAGES } from '@/utils/images';
import {
  useAddParticipationMutation,
  useDeleteParticipationMutation,
  useGetUserDetailsQuery,
} from '@/services/backendApi';
import { formatDistance } from 'date-fns';
import { Entypo, AntDesign } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import {
  addToParticipatingList,
  removeFromParticipatingList,
} from '@/features/participatingSlice';
import { CATEGORIES } from '@/utils/consts';

export default function DiscoverQuizCard({ quiz }: { quiz: Quiz }) {
  // Fetch the details of the quiz host, where quiz.quizOwner is the ID of the host.
  const { data: host } = useGetUserDetailsQuery(quiz.quizOwner);

  // Local state to manage the participation status of the current user in the quiz.
  const [participating, setParticipating] = useState(false);

  // RTK Query mutation hooks for adding or deleting participation records.
  const [createParticipation] = useAddParticipationMutation();
  const [deleteParticipation] = useDeleteParticipationMutation();

  // Retrieves the current user's ID from Redux state for participation operations.
  const id = useAppSelector((state) => state.userIdSlice.id);
  // Retrieves the list of quizzes the current user is participating in from Redux state.
  const participatingList = useAppSelector(
    (state) => state.participatingSlice.value
  );

  // Hook to dispatch actions to Redux store.
  const dispatch = useAppDispatch();

  // Function to handle press events which toggles the user's participation status.
  const onPress = () => {
    if (participating) {
      // If already participating, delete participation record and update Redux state.
      deleteParticipation({ quizId: quiz.id!, userId: id });
      dispatch(removeFromParticipatingList(quiz));
    } else {
      // If not participating, create participation record and update Redux state.
      createParticipation({ quizId: quiz.id!, userId: id });
      dispatch(addToParticipatingList(quiz));
    }
    // Toggle the local participating state to reflect change.
    setParticipating((prev) => !prev);
  };

  // Effect hook to set the participating state based on the participatingList from Redux on mount.
  useEffect(() => {
    participatingList.forEach((q) => {
      if (q.id === quiz.id) setParticipating(true); // If the quiz is in the participating list, set participating to true.
    });
  }, []); 

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={CATEGORY_IMAGES[quiz.category]}
          style={styles.image}
          contentFit="cover"
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.quizName}>{quiz.quizName}</Text>
        <Text style={styles.category}>{CATEGORIES[quiz.category]}</Text>
        <Text style={styles.category}>{host?.username}</Text>
        <Text style={styles.category}>
          {formatDistance(quiz.dateTime, Date.now(), { addSuffix: true })}
        </Text>
      </View>
      <Pressable style={styles.addParticipation} onPress={onPress}>
        {participating ? (
          <AntDesign name="checkcircle" size={24} color="black" />
        ) : (
          <Entypo name="add-to-list" size={24} color="black" />
        )}
      </Pressable>
    </View>
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
