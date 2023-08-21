'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import Question from '../question/question';
import { quizSocketService } from '@/redux/services/quizSocketService';
import { peersSocketService } from '@/redux/services/peersSocketService';

export default function UserStream() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0); // BUG not being updated or passed down properly
  const [consumerTransportState, setConsumerTransportState] = useState<mediasoupTypes.Transport>({} as mediasoupTypes.Transport)
  const [consumerState, setConsumerState] = useState<mediasoupTypes.Consumer>({} as mediasoupTypes.Consumer)

  const remoteVideo = useRef<HTMLVideoElement>(null);

  const host = false;

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  // let producerTransport: mediasoupTypes.Transport;
  let consumerTransport: mediasoupTypes.Transport;
  // let producer: mediasoupTypes.Producer;
  let consumer: mediasoupTypes.Consumer;
  // let isProducer = false;

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.startQuizListener(setQuizStarted)
    quizSocketService.startTimerListener(setQuestionHidden);
    quizSocketService.revealListener(setQuestionHidden, setTrigger, setCurrentQuestionNumber, host);
    peersSocketService.successListener()
    peersSocketService.producerClosedListener(consumerTransportState, consumerState)
  }, []);



  // interface screenSize {
  //   width: number | undefined;
  //   height: number | undefined;
  // }

  // const [screenSize, setScreenSize] = useState<screenSize>({
  //   width: undefined,
  //   height: undefined,
  // });

  // useEffect(() => {
  //   setScreenSize({
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //   });
  // }, []);


  // Consume Trigger
  const goConsume = () => {
    device === undefined ? getRtpCapabilities() : createRecvTransport();
    console.log('goConsume');
  };

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    peersSocketService.emitCreateRoom(createDevice);
  };

  const createDevice = async (rtpCapabilities: mediasoupTypes.RtpCapabilities) => {
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
    )
  };

  const connectRecvTransport = async (
    connConsumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    connDevice: mediasoupTypes.Device
  ) => {
    const response = peersSocketService.emitConsume(connConsumerTransport, connDevice, consumer, remoteVideo)
    setConsumerTransportState(response.consumerTransport)
    setConsumerState(response.consumer)
  };

  return (
    <>
      <div className="user-unit">
        {/* <div className="video-container">
          <video ref={remoteVideo} className="video" autoPlay={true}></video>
        </div> */}
        <div className="question-component">
          <div className="question-component">
            {quizStarted && (
              <Question
                trigger={trigger}
                hidden={questionHidden}
                currentQuestionNumber={currentQuestionNumber}
                setCurrentQuestionNumber={setCurrentQuestionNumber}
                />
                )}
          </div>
        </div>
        <canvas id="countdown-canvas"></canvas>
        <div className="current-question"></div>
      </div>
      <button id='join-stream-btn' onClick={goConsume} disabled={false} >Join Stream</button>
    </>
  );
}
