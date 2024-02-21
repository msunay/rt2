import { Participation, ParticipationAndAnswers } from '@/types/Types';
import { useState, useEffect } from 'react';
import { useGetParticipationAnswersQuery } from '@/services/backendApi';
import { View, Text } from 'react-native';

export default function FinalScore({
  userParticipation,
}: {
  userParticipation: Participation;
}) {
  // Fetch participation answers for a specific user's participation using its ID.
  const { data } = useGetParticipationAnswersQuery(userParticipation.id!);

  // State to keep track of the player's score.
  const [playerScore, setPlayerScore] = useState(0);
  // State to store the player's answers along with the quiz participation details.
  const [playerAnswerSheet, setPlayerAnswerSheet] =
    useState<ParticipationAndAnswers | null>(null);

  // Effect hook to process fetched data.
  useEffect(() => {
    if (data) {
      // Store the fetched data in state.
      setPlayerAnswerSheet(data);

      let count = 0; // Variable to count correct answers.

      // Iterate over each answer in the fetched data.
      data.answers.forEach((answer, i) => {
        console.log(`Answer${i}: `, answer); // Log each answer for debugging.
        if (answer.isCorrect) count++; // Increment count if the answer is correct.
        console.log(count); // Log current count for debugging.
      });

      // Update the player's score based on the number of correct answers.
      setPlayerScore(count);
    }
  }, [data]);

  return (
    <View>
      <Text>You scored: {playerScore} / 10 </Text>
    </View>
  );
}
