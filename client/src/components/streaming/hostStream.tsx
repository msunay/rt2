'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/Types/PeerSocketTypes';
import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { userApiService } from '@/redux/services/apiService';
import Question from '../question/question';
import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/Types/QuizSocketTypes';
import { CurrentTime, createCountdownBar } from 'countdownbar'
import CanvasCircularCountdown from 'canvas-circular-countdown';
import { useAppSelector } from '@/redux/hooks';

export default function HostStream() {

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const userParticipationAnswer = useAppSelector(state => state.userParticipationAnswerSlice)
  const [questionHidden, setQuestionHidden] = useState(false)
  const [trigger, setTrigger] = useState(0);

  const quiz: Socket<QuizServerToClientEvents, QuizClientToServerEvents> = io(
    'http://localhost:3001/quizspace'
  );

  // quiz.on('connection_success', ({ socketId }) => {
  //   console.log(socketId);
  // })

  useEffect(() => {
    quiz.on('start_question_timer', () => {
      startTimer()
    })

    quiz.on('reveal_answers', () => {
      console.log('reveal');
      //@ts-ignore
      document.querySelectorAll('button[name="a"]').forEach((btn, i) => btn.disabled = true)

      setTimeout(() => {
        setQuestionHidden(true);
        document.getElementById('countdown-canvas')!.hidden = true
        setTrigger((trigger) => trigger + 1);
      }, 2000)
    })
  })


  const localVideo = useRef<HTMLVideoElement>(null);


  function startQuiz() {
    startTimer()
    setQuizStarted(true);
    quiz.emit('host_start_quiz')
  }

  function nextQuestion() {
    //@ts-ignore
    document.querySelectorAll('button[name="a"]').forEach((btn, i) => btn.disabled = false)
    setCurrentQuestionNumber(currentQuestionNumber + 1);
    console.log(currentQuestionNumber);
    setQuestionHidden(false)
    document.getElementById('countdown-canvas')!.hidden = false;
    quiz.emit('next_question');
    // startTimer()
  }

  function startTimer () {
    const pickColorByPercentage = (percentage: any, time: any) => {
      switch (true) {
        case percentage >= 75:
          return '#28a745'; // green
        case percentage >= 50 && percentage < 75:
          return '#17a2b8'; // blue
        case percentage >= 25 && percentage < 50:
          return '#ffc107'; // orange
        default:
          return '#dc3545'; // red
      }
    }
      new CanvasCircularCountdown(document.getElementById('countdown-canvas'), {
      duration: 7 * 1000,
      radius: 150,
      clockwise: true,
      captionColor: pickColorByPercentage,
      progressBarWidth: 20,
      progressBarOffset: 0,
      circleBackgroundColor: '#f5f5f5',
      emptyProgressBarBackgroundColor: '#b9c1c7',
      filledProgressBarBackgroundColor: '#17a2b8',
      captionFont: '22px serif',
      showCaption: true
    }).start();
  }

  const peers: Socket<PeersServerToClientEvents, PeersClientToServerEvents> =
    io('http://localhost:3001/mediasoup');

  peers.on('connection_success', ({ socketId, producerAlreadyExists }) => {
    console.log(socketId, producerAlreadyExists);
  });

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let producerTransport: mediasoupTypes.Transport;
  let producer: mediasoupTypes.Producer;
  let mediaStream: MediaStream;
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

  const stream = () => {
    goConnect();
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

  const createDevice = async () => {
    try {
      device = new mediasoupClient.Device();

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

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    // send to client
    peers.emit('create_room', (data: any) => {
      console.log(`Router RTP Capabilities: ${data.rtpCapabilities}`);

      //assign to local variable
      rtpCapabilities = data.rtpCapabilities;
      // create device with rtp capabilities
      createDevice();
    });
  };

  const createSendTransport = () => {
    peers.emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportParams }) => {
        // if (sendTransportParams.error) {
        //   console.log(sendTransportParams.error);
        //   return;
        // }
        console.log(transportParams);

        producerTransport = device.createSendTransport(transportParams);

        producerTransport.on(
          'connect',
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Singnal local DTLS parameters to the server side transport
              peers.emit('transport_connect', {
                // transportId: producerTransport.id,
                dtlsParameters: dtlsParameters,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error: any) {
              errback(error);
            }
          }
        );

        producerTransport.on(
          'produce',
          async (parameters, callback, errback) => {
            console.log(parameters);

            try {
              peers.emit(
                'transport_produce',
                {
                  // transportId: producerTransport.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                },
                ({ id }) => {
                  // Tell the transport that parameters were transmitted and provide it with the
                  // server side producers's id
                  callback({ id });
                }
              );
            } catch (err: any) {
              errback(err);
            }
          }
        );

        connectSendTransport();
      }
    );
  };

  const connectSendTransport = async () => {
    console.log(params);
    producer = await producerTransport.produce(params);

    producer.on('trackended', () => {
      console.log('Track ended');
      // Close video track
    });

    producer.on('transportclose', () => {
      console.log('transport ended');
      // Close video track
    });
  };

  const endStream = () => {
    producer.close();
    producerTransport.close();
    mediaStream.getTracks().forEach((track) => track.stop());
  };

  // const value = {
  //   currentQuestionNumber,
  //   setCurrentQuestionNumber
  // }
  return (
    <>
      <div className="host-unit">
        <div className="video-container">
          <video ref={localVideo} className="video" autoPlay={true}></video>
          <div className="question-component">
          {quizStarted && (
            <Question
              trigger={trigger}
              hidden={questionHidden}
              host={true}
              currentQuestionNumber={currentQuestionNumber}
              setCurrentQuestionNumber={setCurrentQuestionNumber}
            />
          )}
        </div>
        </div>
        <canvas id="countdown-canvas"></canvas>
        <div className="quiz-controls">
          {quizStarted ? (
            currentQuestionNumber === 9 ? (
              <button className="next-q-btn">Reveal Scores</button>
            ) : (
              <button className="next-q-btn" onClick={nextQuestion}>
                Next Question
              </button>
            )
          ) : (
            <button className="next-q-btn" onClick={startQuiz}>
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
