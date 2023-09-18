'use client';

import { userApiService } from '@/redux/services/apiService';
import { useEffect, useState } from 'react';
import { Winner } from '@/Types/Types';

export default function Winners({
  quizId,
  partId,
}: {
  quizId: string;
  partId: string;
}) {
  const [winnerList, setWinnerList] = useState<Winner[]>([]);

  useEffect(() => {
    userApiService.getWinners(quizId).then((data) => setWinnerList(data));
  }, []);

  return (
    <div>
      <h1>Winners</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {winnerList.map((winner) => (
            <tr key={winner.username}>
              <td>{winner.username}</td>
              <td>{winner.userScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
