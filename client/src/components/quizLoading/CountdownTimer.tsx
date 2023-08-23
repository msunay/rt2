'use client'

import React, { useEffect, useState } from 'react';
import styles from '../../app/quizLoading/quizLoading.module.css';
import { useRouter } from 'next/navigation';
import moment from 'moment';

export default function CountdownTimer({
  startTime,
  participationId,
}: {
  startTime: Date;
  participationId: string;
}) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const updateDuration = () => {
      const duration = moment.duration(moment(startTime).diff(moment()));
      if (duration.asMilliseconds() <= 0) {
        router.push('/playQuiz/' + participationId);
        return '00:00:00';
      }
      const dayText = duration.days() === 1 ? 'day' : 'days';
      return duration.days() > 0
        ? `${duration.days()} ${dayText} ${String(duration.hours()).padStart(
            2,
            '0'
          )}:${String(duration.minutes()).padStart(2, '0')}:${String(
            duration.seconds()
          ).padStart(2, '0')}`
        : `${String(duration.hours()).padStart(2, '0')}:${String(
            duration.minutes()
          ).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`;
    };

    setTimeRemaining(updateDuration());

    const interval = setInterval(() => {
      setTimeRemaining(updateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, router]);

  return (
    <div className={styles.countdownContainer}>
      <p>STARTING IN:</p>
      <h3 className={styles.countdownTime}>{timeRemaining}</h3>
    </div>
  );
}
