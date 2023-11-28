import React from 'react';
import { Quiz } from '../../Types/Types';
import styles from '@/styles/quizLoading.module.css';

export default function QuizInfo({ quiz }: { quiz: Quiz }) {

  return (
    <div className={styles.quizInfoContainer} >
      <h2 className={styles.quizTitle}>{quiz.quizName}</h2>
      <div className={styles.infoGroup}>
        <span className={styles.contentText}>Category: {quiz.category}</span>
      </div>
    </div>
  );
}
