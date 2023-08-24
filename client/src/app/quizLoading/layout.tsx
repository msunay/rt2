import React, { ReactNode } from 'react';
import styles from './quizLoading.module.css';
import Link from 'next/link';

type QuizLoadingLayoutProps = {
    children: ReactNode;
};

const QuizLoadingLayout: React.FC<QuizLoadingLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      {children}
      <Link href='/dashboard' className={styles.btn_back}>
            go back
      </Link>
    </div>
  );
}

export default QuizLoadingLayout;


