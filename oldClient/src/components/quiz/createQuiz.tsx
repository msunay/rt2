'use client'

import React, { useState } from 'react';
import { userApiService } from '@/redux/services/apiService';
import { useAppSelector } from '@/redux/hooks';
import styles from '@/styles/quiz.module.css';

export default function CreateQuiz() {
  const ownerId = useAppSelector((state) => state.userIdSlice.value);
  const [startTime, setStartTime] = useState(new Date());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await userApiService.addDemoQuiz(ownerId, startTime);
      console.log('Quiz created successfully!');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <>
      <form className={styles.create_quiz} onSubmit={handleSubmit}>
        <input
          type="datetime-local"
          value={startTime.toISOString().slice(0, -8)}
          onChange={(e) => setStartTime(new Date(e.target.value))}
        />
        <button type="submit">Create Quiz</button>
      </form>
    </>
  );
}
