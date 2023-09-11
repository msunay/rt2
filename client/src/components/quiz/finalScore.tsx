'use client';

import { Participation, ParticipationAndAnswers } from '@/Types/Types';
import { useState, useEffect } from 'react';
import { userApiService } from '@/redux/services/apiService';
import 'animate.css';


export default function FinalScore({
  userParticipation,
}: {
  userParticipation: Participation;
}) {
  const [playerScore, setPlayerScore] = useState(0);
  const [playerAnswerSheet, setPlayerAnswerSheet] =
    useState<ParticipationAndAnswers | null>(null);

  useEffect(() => {
    userApiService
      .getParticipationAnswers(userParticipation.id!)
      .then((data) => {
        setPlayerAnswerSheet(data);

        let count = 0;

        data.answers.forEach((answer, i) => {
          console.log(`Answer${i}: `, answer);
          if (answer.isCorrect) count++;
          console.log(count);
        });

        setPlayerScore(count);
      });
  }, []);

  return (
    <div className="animate__bounceIn">
      <span>You scored: {playerScore} / 10 </span>
    </div>
  );
}
