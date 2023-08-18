'use client';

import { ParticipationAndAnswers } from '@/Types/Types';
import { useState, useEffect } from 'react';
import { userApiService } from '@/redux/services/apiService';

// ... (import statements)

export default function FinalScore() {
  const [playerScore, setPlayerScore] = useState(0);
  const [playerAnswerSheet, setPlayerAnswerSheet] =
    useState<ParticipationAndAnswers | null>(null);

  useEffect(() => {
    userApiService
      .getParticipationAnswers('7ff1656b-21df-432f-b1af-21b3f36fff14')
      .then((data) => {
        setPlayerAnswerSheet(data[0]);

        let count = 0;

        data[0].answers.forEach((answer) => {
          if (answer.isCorrect) count++;
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
