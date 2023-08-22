import React from 'react';
import { Quiz } from '../../Types/Types';
import styles from '../../app/QuizLoading/quizLoading.module.css';

interface QuizInfoProps {
  quiz: Quiz;
}

const QuizInfo: React.FC<QuizInfoProps> = ({ quiz }) => {
  return (
    <div className={styles.quizInfoContainer}>
      <h2 className={styles.quizName}>{quiz.quizName}</h2>
      <p className={styles.hostName}>Hosted by: {quiz.host_name}</p>
      <p className={styles.category}>Category: {quiz.category}</p>
    </div>
  );
};

export default QuizInfo;