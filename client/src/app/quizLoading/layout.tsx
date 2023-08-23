import React, { ReactNode } from 'react';
import styles from '@/styles/quizLoading.module.css';

type QuizLoadingLayoutProps = {
    children: ReactNode;
};

const QuizLoadingLayout: React.FC<QuizLoadingLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}

export default QuizLoadingLayout;

