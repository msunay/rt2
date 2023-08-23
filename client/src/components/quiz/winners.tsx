'use client';

import { userApiService } from '@/redux/services/apiService';
import { useEffect, useState } from 'react';
import { Participation } from '@/Types/Types';

export default function Winners({ quizId }: { quizId: string }) {
  const [participations, setParticipations] = useState<Participation[]>([]);

  // useEffect(() => {
  //   userApiService.getAllParticipationAnswers().then((data) => {
  //     const quizParticipationAnswers = data.filter((participationAnswers) => {

  //     });
  //     setParticipations(quizParticipations);
  //   });
  // }, []);

  useEffect(() => {
    participations.forEach((participation) => {});
  });

  return <p>s</p>;
}
