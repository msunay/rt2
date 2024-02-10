import { StyleSheet, Text, View } from 'react-native';
import {
  useGetAllQuizzesQuery,
  useGetUserDetailsQuery,
} from '@/services/backendApi';
import { useEffect, useState } from 'react';
import { Quiz } from '@/types/Types';
import { format } from 'date-fns';
import { Image, ImageBackground } from 'expo-image';
import { TILE_IMAGES } from '@/utils/images';

export default function PlayNextQuizBtn() {
  const { data, error, isLoading } = useGetAllQuizzesQuery();

  const [nextQuiz, setNextQuiz] = useState<Quiz>();
  // const { data: host, refetch } = useGetUserDetailsQuery(nextQuiz!.quizOwner)

  useEffect(() => {
    if (data) {
      const sorted = [...data];
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      setNextQuiz(sorted[0]);
    }
  }, [data]);

  useEffect(() => {
    if (nextQuiz) {
      // refetch()
    }
  }, [nextQuiz]);

  return (
    <ImageBackground
      style={styles.playNextQuizBtnBackground}
      source={TILE_IMAGES.nextQuizBg}

    >
      <Image
        source={TILE_IMAGES.questionBubbles}
        style={styles.questionBubbles}
        contentFit="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.h1Text}>Play Next Quiz!</Text>
      </View>
      <View style={styles.nextQuizDetails}>
        <Text style={styles.detailsText}>{nextQuiz && nextQuiz.quizName}</Text>
        <Text style={styles.detailsText}>{nextQuiz && nextQuiz.category}</Text>
        <Text style={styles.detailsText}>
          {nextQuiz && format(nextQuiz.dateTime, 'PPPp')}
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  playNextQuizBtnBackground: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    // borderRadius: 17,
    // backgroundColor: '#25CED1',
    // shadowColor: '#000000',
    // shadowOffset: { width: 1, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  questionBubbles: {
    alignSelf: 'flex-end',
    height: '65%',
    width: '65%',
    position: 'absolute',
    bottom: 5,
  },
  textContainer: {
    width: '40%',
    marginLeft: '5%',
    marginTop: '2%',
    alignSelf: 'flex-start'
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  h1Text: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
  },
  nextQuizDetails: {
    // flex: 1,
    height: '100%',
    justifyContent: 'space-around',
    width: '45%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  detailsText: {
    color: 'white',
    fontFamily: 'Nunito-Regular',
  },
});
