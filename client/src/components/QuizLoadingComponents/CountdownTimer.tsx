import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    startTime: string; // Expected ISO string format like "2023-08-24T11:15:10.620Z"
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime }) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        const startDate = new Date(startTime).getTime();
        const updateInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = startDate - now;

            setTimeRemaining(distance);

            if (distance < 0) {
                clearInterval(updateInterval);
            }
        }, 1000);

        return () => clearInterval(updateInterval);
    }, [startTime]);

    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return (
        <div>
            STARTING, IN:
            <div>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
        </div>
    );
}

export default CountdownTimer;
