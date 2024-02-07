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
import { addToParticipatingList, removeFromParticipatingList } from '@/features/participatingSlice';

export default function DiscoverQuizCard({ quiz }: { quiz: Quiz }) {
  const { data: host } = useGetUserDetailsQuery(quiz.quizOwner);
  const [participating, setParticipating] = useState(false);

  const [createParticipation] = useAddParticipationMutation();
  const [deleteParticipation] = useDeleteParticipationMutation();

  const id = useAppSelector((state) => state.userIdSlice.id);
  const participatingList = useAppSelector((state) => state.participatingSlice.value)

  const dispatch = useAppDispatch();

  const onPress = () => {
    if (participating) {
      deleteParticipation({ quizId: quiz.id!, userId: id })
      dispatch(removeFromParticipatingList(quiz));
    } else {
      createParticipation({ quizId: quiz.id!, userId: id });
      dispatch(addToParticipatingList(quiz))
    }
    setParticipating(prev => !prev);
  };

  useEffect(() => {
    participatingList.forEach((q) => {
      if (q.id === quiz.id) setParticipating(true);
    })
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={CATEGORY_IMAGES['general-knowledge']}
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
