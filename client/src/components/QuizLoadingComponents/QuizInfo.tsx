import React from 'react';
import { Quiz } from '../../Types/Types';
import styles from '../../app/QuizLoading/quizLoading.module.css';

interface QuizInfoProps {
  quiz: Quiz;
}

const QuizInfo: React.FC<QuizInfoProps> = ({ quiz }) => {
  return (
    <div className={styles.quizInfoContainer}>
      <h2 className={styles.quizTitle}>{quiz.quizName}</h2>
      <div className={styles.infoGroup}>
        <span className={styles.label}>Quiz Host:</span>
        <span className={styles.contentText}>{quiz.host_name}</span>
      </div>
      <div className={styles.infoGroup}>
        <span className={styles.label}>Category:</span>
        <span className={styles.contentText}>{quiz.category}</span>
      </div>
    </div>
  );
};

export default QuizInfo;