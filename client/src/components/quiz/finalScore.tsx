import { Participation, ParticipationAndAnswers } from '@/types/Types';
import { useState, useEffect } from 'react';
// import 'animate.css';
import { useGetParticipationAnswersQuery } from '@/services/backendApi';
import { View, Text } from 'react-native';

export default function FinalScore({
  userParticipation,
}: {
  userParticipation: Participation;
}) {
  const { data } = useGetParticipationAnswersQuery(userParticipation.id!);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerAnswerSheet, setPlayerAnswerSheet] =
    useState<ParticipationAndAnswers | null>(null);

  useEffect(() => {
    if (data) {
      setPlayerAnswerSheet(data);

      let count = 0;

      data.answers.forEach((answer, i) => {
        console.log(`Answer${i}: `, answer);
        if (answer.isCorrect) count++;
        console.log(count);
      });

      setPlayerScore(count);
    }
  }, [data]);

  return (
    <View>
      <Text>You scored: {playerScore} / 10 </Text>
    </View>
  );
}
