'use client';

import styles from '@/styles/streaming.module.css';
import React, { useEffect, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import PlayerQuestion from '../question/playerQuestion';
import { quizSocketService } from '@/redux/services/quizSocketService';
import { peersSocketService } from '@/redux/services/peersSocketService';
import FinalScore from '../quiz/finalScore';
import { userApiService } from '@/redux/services/apiService';
import { useAppSelector } from '@/redux/hooks';
import { Participation } from '@/Types/Types';
import Winners from '../quiz/winners';
import Link from 'next/link';
import Image from 'next/image';
import CloseLine from '@/public/close-line.svg';

export default function UserStream({ partId }: { partId: string }) {
  // const userId = useAppSelector((state) => state.userIdSlice.value);
  const currentQuestionNumber = useAppSelector(
    (state) => state.questionSlice.value
  );
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0); // BUG not being updated or passed down properly
  const [consumerTransportState, setConsumerTransportState] =
    useState<mediasoupTypes.Transport>({} as mediasoupTypes.Transport);
  const [consumerState, setConsumerState] = useState<mediasoupTypes.Consumer>(
    {} as mediasoupTypes.Consumer
  );
  const [userParticipation, setUserParticipation] = useState<Participation>(
    {} as Participation
  );

  const remoteVideo = useRef<HTMLVideoElement>(null);

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let consumerTransport: mediasoupTypes.Transport;
  let consumer: mediasoupTypes.Consumer;

  useEffect(() => {
    userApiService.getOneParticipationByPartId(partId).then((participation) => {
      setUserParticipation(participation);
    });

    quizSocketService.successListener();
    quizSocketService.playerWinnersListener(setTrigger);
    quizSocketService.startQuizListener(setQuizStarted);
    quizSocketService.startTimerListener(setQuestionHidden);
    quizSocketService.revealListener(setQuestionHidden, setTrigger);
    peersSocketService.successListener();
    peersSocketService.producerClosedListener(
      consumerTransportState,
      consumerState
    );
  }, []);

  // Consume Trigger
  const goConsume = () => {
    device === undefined ? getRtpCapabilities() : createRecvTransport();
    console.log('goConsume');
  };

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    peersSocketService.emitCreateRoom(createDevice);
  };

  const createDevice = async (
    rtpCapabilities: mediasoupTypes.RtpCapabilities
  ) => {
    try {
      device = new mediasoupClient.Device();
      console.log('RTP Capabilities: ', rtpCapabilities);
      await device.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      console.log('Device RTP Capabilities', device.rtpCapabilities);

      // once device loads create transport
      createRecvTransport();
    } catch (err: any) {
      console.error(err);
      if (err.name === 'UnsupportedError')
        console.warn('Browser not supported');
    }
  };

  const createRecvTransport = async () => {
    peersSocketService.emitcreateConsumerWebRtcTransport(
      consumerTransport,
      device,
      connectRecvTransport
    );
  };

  const connectRecvTransport = async (
    connConsumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    connDevice: mediasoupTypes.Device
  ) => {
    const response = peersSocketService.emitConsume(
      connConsumerTransport,
      connDevice,
      consumer,
      remoteVideo
    );
    setConsumerTransportState(response.consumerTransport);
    setConsumerState(response.consumer);
  };

  return (
    <>
      <div className={styles.unit}>
        <Link href="/dashboard" className={styles.close_btn}>
          <Image src={CloseLine} height={40} width={40} alt="close image" />
        </Link>
        <canvas className={styles.count_down} id="countdown-canvas"></canvas>
        <div className={styles.video_container}>
          <video
            ref={remoteVideo}
            className={styles.video}
            autoPlay={true}
          ></video>
        </div>
        {trigger < 11 ? (
          trigger === 10 ? (
            <FinalScore userParticipation={userParticipation} />
          ) : (
            <div className="question-component">
              {quizStarted && (
                <PlayerQuestion
                  partId={partId}
                  trigger={trigger}
                  hidden={questionHidden}
                />
              )}
            </div>
          )
        ) : (
          <>
            <p>HEY</p>
            <Winners quizId={userParticipation.QuizId!} partId={partId}/>
          </>
        )}

        <div className="current-question"></div>
      </div>
      <button
        className={styles.btn_join}
        id="join-stream-btn"
        onClick={goConsume}
        disabled={false}
      >
        Join Stream
      </button>
    </>
  );
}
