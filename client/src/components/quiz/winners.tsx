import { useEffect, useState } from 'react';
import { Winner } from '@/types/Types';
import { useGetWinnersQuery } from '@/services/backendApi';
import { StyleSheet, Text, View } from 'react-native';

export default function Winners({ quizId }: { quizId: string }) {
  // Fetch all users with the top score
  const { data } = useGetWinnersQuery(quizId);
  // Local state to hold winners
  const [winnerList, setWinnerList] = useState<Winner[]>([]);

  // Effect hook to set winnerList state
  useEffect(() => {
    if (data) {
      setWinnerList(data);
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <Text>Winners</Text>
      <View>
        {winnerList.map((winner, index) => (
          <View key={index}>
            <Text>{winner.username}</Text>
            <Text>{winner.userScore}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
