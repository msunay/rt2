'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import Question from '../question/question';
import {
  quizSocketService,
  startTimer,
} from '@/redux/services/quizSocketService';
import { peersSocketService } from '@/redux/services/peersSocketService';

export default function HostStream({ quizId }: { quizId: string }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0); // BUG not being updated or passed down properly

  const localVideo = useRef<HTMLVideoElement>(null);
  const nextQBtn = useRef<HTMLButtonElement>(null);
  const startBtn = useRef<HTMLButtonElement>(null);

  const host = true;
  let device: mediasoupTypes.Device;
  let producerTransport: mediasoupTypes.Transport;
  let producer: mediasoupTypes.Producer;
  let mediaStream: MediaStream;
  // let nextQBtn: HTMLButtonElement;

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.startTimerListener(setQuestionHidden);
    quizSocketService.revealListener(
      setQuestionHidden,
      setTrigger,
      setCurrentQuestionNumber,
      host,
      nextQBtn
    );
    peersSocketService.successListener();
  }, []);

  function startQuiz() {
    startTimer();
    setQuizStarted(true);
    quizSocketService.emitHostStartQuiz();
    quizSocketService.emitNextQ();
    startBtn.current!.disabled = true;
  }

  function nextQuestion() {
    document
      .querySelectorAll('button[name="a"]')
      //@ts-ignore
      .forEach((btn) => (btn.disabled = false));
    setCurrentQuestionNumber(
      (currentQuestionNumber) => currentQuestionNumber + 1
    );
    console.log(currentQuestionNumber);
    // setQuestionHidden(false);
    document.getElementById('countdown-canvas')!.hidden = false;
    quizSocketService.emitNextQ();
    startTimer();

    nextQBtn.current!.disabled = true;
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
    producer.close();
    producerTransport.close();
    mediaStream.getTracks().forEach((track) => track.stop());
  };

  return (
    <>
      <div className="host-unit">
        <div className="video-container">
          <video ref={localVideo} className="video" autoPlay={true}></video>
          <canvas id="countdown-canvas"></canvas>
          <div className="question-component">
            {quizStarted && (
              <Question
                quizId={quizId}
                trigger={trigger}
                hidden={questionHidden}
                currentQuestionNumber={currentQuestionNumber}
                setCurrentQuestionNumber={setCurrentQuestionNumber}
              />
            )}
          </div>
        </div>
        <div className="quiz-controls">
          {quizStarted ? (
            currentQuestionNumber === 9 ? (
              <button
                className="next-q-btn"
                onClick={() =>
                  setCurrentQuestionNumber(
                    (currentQuestionNumber) => currentQuestionNumber + 1
                  )
                }
              >
                Reveal Scores
              </button>
            ) : (
              <button
                ref={nextQBtn}
                className="next-q-btn"
                onClick={nextQuestion}
              >
                Next Question
              </button>
            )
          ) : (
            <button ref={startBtn} className="next-q-btn" onClick={startQuiz}>
              Start Quiz
            </button>
          )}
        </div>

        <div className="stream-controls">
          <button className="stream-btns" onClick={getLocalStream}>
            Start Video
          </button>
          <button className="stream-btns" onClick={stream}>
            Stream
          </button>
          <button className="stream-btns" onClick={endStream}>
            End Stream
          </button>
        </div>
      </div>
    </>
  );
}
