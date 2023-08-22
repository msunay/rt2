import React, { useEffect, useState } from 'react';
import styles from '../../app/QuizLoading/quizLoading.module.css';
import router from 'next/router';

interface CountdownTimerProps {
  startTime: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startDate = new Date(startTime).getTime();
      const distance = startDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });

      if (distance <= 0) {
        //TODO: Update the route
        router.push('/UserStream/');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, router]);

  const renderTime = () => {
    if (timeRemaining.days > 0) {
      const dayText = timeRemaining.days === 1 ? 'day' : 'days';
      return `${timeRemaining.days} ${dayText} ${String(timeRemaining.hours).padStart(2, '0')}:${String(
        timeRemaining.minutes
      ).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
    }
    return `${String(timeRemaining.hours).padStart(2, '0')}:${String(
      timeRemaining.minutes
    ).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
  };

  return (
    <div className={styles.countdownContainer}>
      <p>STARTING, IN:</p>
      <h3 className={styles.countdownTime}>{renderTime()}</h3>
    </div>
  );
};

export default CountdownTimer;