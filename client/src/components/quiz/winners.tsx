'use client';

import { userApiService } from '@/redux/services/apiService';
import { useEffect, useState } from 'react';
import { Participation } from '@/Types/Types';

export default function Winners({ quizId }: { quizId: string }) {
  const [quizParticipations, setParticipations] = useState<Participation[]>([]);
  const [winnerList, setWinnerList] = useState<string[]>([]);
  const [resultsTable, setResultsTable] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    userApiService.getQuizParticipations(quizId).then((data) => {
      setParticipations(data);
    });
  }, []);

  useEffect(() => {
    quizParticipations.forEach((participation) => {
      userApiService.getParticipationAnswers(participation.id!).then((data) => {
        const correctAnswersCount = data[0].answers.reduce(
          (count, answer) => count + (answer.isCorrect ? 1 : 0),
          0
        );

        setResultsTable((prevResults) => {
          const updatedResults = { ...prevResults };
          if (updatedResults[data[0].UserId]) {
            updatedResults[data[0].UserId] += correctAnswersCount;
          } else {
            updatedResults[data[0].UserId] = correctAnswersCount;
          }
          return updatedResults;
        });
      });
    });
  }, [quizParticipations]);

  const highestScore = Math.max(...Object.values(resultsTable), 0);

  const usersWithHighestScore = Object.keys(resultsTable).filter(
    (userId) => resultsTable[userId] === highestScore
  );
  
  useEffect(() => {
    usersWithHighestScore.forEach((userId) => {
      userApiService.getUserDetails(userId).then((data) => 
        setWinnerList([...winnerList, data.username])
      );
    })
  }, [resultsTable]);

  return (
    <div>
      <h1>Winners</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Correct Answers</th>
          </tr>
        </thead>
        <tbody>
          {winnerList.map((username) => (
            <tr key={username}>
              <td>{username}</td>
              <td>{highestScore}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
