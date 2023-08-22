'use client';

import { Participation, ParticipationAndAnswers } from '@/Types/Types';
import { useState, useEffect } from 'react';
import { userApiService } from '@/redux/services/apiService';

// ... (import statements)

export default function FinalScore({userParticipation}: {userParticipation: Participation}) {
  const [playerScore, setPlayerScore] = useState(0);
  const [playerAnswerSheet, setPlayerAnswerSheet] =
    useState<ParticipationAndAnswers | null>(null);

  useEffect(() => {
    userApiService
      .getParticipationAnswers(userParticipation.id!)
      .then((data) => {
        setPlayerAnswerSheet(data[0]);

        let count = 0;

        data[0].answers.forEach((answer, i) => {
          console.log(`Answer${i}: `, answer);
          if (answer.isCorrect) count++;
          console.log(count);
        });

        setPlayerScore(count);
      });
  }, []);

  return (
    <div className="final-score">
      <span>You scored: {playerScore} / 10 </span>
    </div>
  );
}
