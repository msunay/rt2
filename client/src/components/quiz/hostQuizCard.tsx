import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Quiz } from '@/types/Types';
import { Link, router } from 'expo-router';

export default function HostQuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        // router.replace(`/playQuiz/${quiz.id}`);
        console.log(`/playQuiz/${quiz.id}`);
      }}
    >
      <Link href={`/playQuiz/${quiz.id}`}>
        <Text>{quiz.quizName}</Text>
      </Link>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: 100,
    marginBottom: 10,
    borderColor: '#FF0000',
    borderWidth: 1,
  },
});
