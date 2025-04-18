import { useAppSelector } from '@/src/hooks/reduxHooks';
import type { Quiz } from '@/src/types/Types';
import { CATEGORIES } from '@/src/utils/consts';
import { TILE_IMAGES } from '@/src/utils/images';
import { format } from 'date-fns';
import { Image, ImageBackground } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PlayNextQuizBtn() {
  // Fetch all quizzes.
  const quizzes = useAppSelector(state => state.quizzesSlice.allQuizzes);

  // Local state to hold the next upcoming quiz.
  const [nextQuiz, setNextQuiz] = useState<Quiz>();

  // Sort all quizzes in chronological order an set the first quiz as next quiz.
  useEffect(() => {
    setNextQuiz(quizzes[0]);
  }, [quizzes]);

  return (
    <ImageBackground
      style={styles.playNextQuizBtnBackground}
      source={TILE_IMAGES.nextQuizBg}
    >
      <Image
        source={TILE_IMAGES.questionBubbles}
        style={styles.questionBubbles}
        contentFit='contain'
      />
      <View style={styles.textContainer}>
        <Text style={styles.h1Text}>Play Next Quiz!</Text>
      </View>
      <View style={styles.nextQuizDetails}>
        <Text style={styles.detailsText}>{nextQuiz?.quizName}</Text>
        <Text style={styles.detailsText}>
          {nextQuiz && CATEGORIES[nextQuiz.category]}
        </Text>
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
    marginVertical: 5,
    borderRadius: 17,
    overflow: 'hidden',
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
    alignSelf: 'flex-start',
  },
  h1Text: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
  },
  nextQuizDetails: {
    height: '100%',
    justifyContent: 'space-around',
    width: '45%',
  },
  detailsText: {
    color: 'white',
    fontFamily: 'Nunito-Regular',
  },
});
