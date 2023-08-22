import React, { useEffect, useState } from 'react';
import styles from '../../app/QuizLoading/quizLoading.module.css';
import router from 'next/router';
import moment from 'moment';

interface CountdownTimerProps {
  startTime: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateDuration = () => {
      const duration = moment.duration(moment(startTime).diff(moment()));
      if (duration.asMilliseconds() <= 0) {
        router.push('/UserStream/');
        return "00:00:00";
      }
      const dayText = duration.days() === 1 ? 'day' : 'days';
      return duration.days() > 0
        ? `${duration.days()} ${dayText} ${String(duration.hours()).padStart(2, '0')}:${String(duration.minutes()).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`
        : `${String(duration.hours()).padStart(2, '0')}:${String(duration.minutes()).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`;
    };

    setTimeRemaining(updateDuration());

    const interval = setInterval(() => {
      setTimeRemaining(updateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, router]);

  return (
    <div className={styles.countdownContainer}>
      <p>STARTING, IN:</p>
      <h3 className={styles.countdownTime}>{timeRemaining}</h3>
    </div>
  );
};

export default CountdownTimer;