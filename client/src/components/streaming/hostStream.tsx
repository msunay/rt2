'use client';

import styles from '@/styles/streaming.module.css';
import React, { useEffect, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import HostQuestion from '../question/hostQuestion';
import {
  quizSocketService,
  startTimer,
} from '@/redux/services/quizSocketService';
import { peersSocketService } from '@/redux/services/peersSocketService';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { incrementQuestionNumber } from '@/redux/features/questionSlice';
import { useRouter } from 'next/navigation';



export const QUESTION_TIME = 7000;

export default function HostStream({ quizId }: { quizId: string }) {
  const currentQuestionNumber = useAppSelector(state => state.questionSlice.value)
  const dispatch = useAppDispatch();

  const [quizStarted, setQuizStarted] = useState(false);
  // const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0); // BUG not being updated or passed down properly

  const localVideo = useRef<HTMLVideoElement>(null);
  const nextQBtn = useRef<HTMLButtonElement>(null);
  const startBtn = useRef<HTMLButtonElement>(null);
  const { push } = useRouter();

  let device: mediasoupTypes.Device;
  let producerTransport: mediasoupTypes.Transport;
  let producer: mediasoupTypes.Producer;
  let mediaStream: MediaStream;

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.startTimerListener(setQuestionHidden);
    // quizSocketService.revealListener(
    //   setQuestionHidden
    // );
    quizSocketService.revealAnswerHostListener(setQuestionHidden)
    peersSocketService.successListener();
  }, []);

  function startQuiz() {
    startTimer();
    setQuizStarted(true);
    quizSocketService.emitHostStartQuiz();
    // quizSocketService.emitNextQ();
    dispatch(incrementQuestionNumber())
  }

  function nextQuestion() {
    setQuestionHidden(false);
    if (currentQuestionNumber < 9) {
      nextQBtn.current!.disabled = true;
      setTimeout(() => {
        nextQBtn.current!.disabled = false;
      }, QUESTION_TIME + 2000);
    }
    document
      .querySelectorAll('button[name="a"]')
      //@ts-ignore
      .forEach((btn) => (btn.disabled = false));
    dispatch(incrementQuestionNumber())
    document.getElementById('countdown-canvas')!.hidden = false;
    quizSocketService.emitNextQ();
    startTimer();
    setTrigger((trigger) => trigger + 1);
  }

  const stream = () => {
    goConnect();
  };

  let params: mediasoupTypes.ProducerOptions = {
    encodings: [
      {
        rid: 'r0',
        maxBitrate: 100000,
        scalabilityMode: 'S1T3',
      },
      {
        rid: 'r1',
        maxBitrate: 300000,
        scalabilityMode: 'S1T3',
      },
      {
        rid: 'r2',
        maxBitrate: 900000,
        scalabilityMode: 'S1T3',
      },
    ],
    codecOptions: {
      videoGoogleStartBitrate: 1000,
    },
  };

  const streamSuccess = (mediaStream: MediaStream) => {
    localVideo.current!.srcObject = mediaStream;
    const track = mediaStream.getVideoTracks()[0];
    params = {
      track,
      ...params,
    };
  };

  const getLocalStream = async () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: {
            min: 640,
            max: 1920,
          },
          height: {
            min: 400,
            max: 1080,
          },
        },
      })
      .then((stream) => {
        mediaStream = stream;
        streamSuccess(mediaStream);
      })
      .catch((err) => console.error(err));
  };

  const goConnect = () => {
    device === undefined ? getRtpCapabilities() : createSendTransport();
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
      createSendTransport();
    } catch (err: any) {
      console.error(err);
      if (err.name === 'UnsupportedError')
        console.warn('Browser not supported');
    }
  };

  const createSendTransport = () => {
    peersSocketService.emitcreateProducerWebRtcTransport(
      producerTransport,
      device,
      connectSendTransport
    );
  };

  const connectSendTransport = async (
    producerTransport: mediasoupTypes.Transport
  ) => {
    console.log('ConnectSendTransport params: ', params);
    console.log('ConnectSendTransport producerTransport: ', producerTransport);
    producer = await producerTransport.produce(params);

    producer.on('trackended', () => {
      console.log('Track ended');
      mediaStream.getTracks().forEach((track) => track.stop());
    });

    producer.on('transportclose', () => {
      console.log('transport ended');
      mediaStream.getTracks().forEach((track) => track.stop());
    });
  };

  const endStream = () => {
    push('/dashboard');
    producer.close();
    // producerTransport.close();
    mediaStream.getTracks().forEach((track) => track.stop());
  };

  return (
    <div className={styles.unit}>
      <div className={styles.video_container}>
        <video
          ref={localVideo}
          className={styles.video}
          autoPlay={true}
        ></video>
        <div className="question-component">
          {quizStarted && (
            <HostQuestion
              quizId={quizId}
              trigger={trigger}
              hidden={questionHidden}
            />
          )}
        </div>
      </div>

      <div className={styles.btn_holder}>
        <div className={styles.quiz_controls}>
          <canvas id="countdown-canvas" width={80} height={80}></canvas>
          {quizStarted ? (
            currentQuestionNumber === 10 ? (
              <button
                className={styles.next_q_btn}
                onClick={() =>
                  dispatch(incrementQuestionNumber())
                }
              >
                Reveal Winners
              </button>
            ) : (
              <button
                ref={nextQBtn}
                className={styles.next_q_btn}
                onClick={nextQuestion}
              >
                Next Question
              </button>
            )
          ) : (
            <button
              ref={startBtn}
              className={styles.next_q_btn}
              onClick={startQuiz}
            >
              Start Quiz
            </button>
          )}
        </div>
        <button className={styles.stream_btns} onClick={getLocalStream}>
          Start Video
        </button>
        <button className={styles.stream_btns} onClick={stream}>
          Stream
        </button>
        <button className={styles.stream_btns} onClick={endStream}>
          End Stream
        </button>
      </div>
    </div>
  );
}
