'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/Types/PeerSocketTypes';
import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';

export default function UserStream() {


  const quiz: Socket<QuizServerToClientEvent, QuizClientToServerEvents> = io(
    'http://localhost:3001/quizspace'
  );

    quiz.on('connection_success', ({ socketId }) => {
      console.log(socketId);
    })














  const remoteVideo = useRef<HTMLVideoElement>(null);

  interface screenSize {
    width: number | undefined;
    height: number | undefined;
  }

  const [screenSize, setScreenSize] = useState<screenSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const peers: Socket<PeersServerToClientEvents, PeersClientToServerEvents> = io(
    'http://localhost:3001/mediasoup'
  );

  peers.on('connection_success', ({ socketId, producerAlreadyExists }) => {
    console.log(socketId, producerAlreadyExists);
  });

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  // let producerTransport: mediasoupTypes.Transport;
  let consumerTransport: mediasoupTypes.Transport;
  // let producer: mediasoupTypes.Producer;
  let consumer: mediasoupTypes.Consumer;
  // let isProducer = false;

  // Consume Trigger
  const goConsume = () => {
    device === undefined ? getRtpCapabilities() : createRecvTransport();
  };

  const createDevice = async () => {
    try {
      device = new mediasoupClient.Device();

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

  const createRecvTransport = async () => {
    peers.emit(
      'createWebRtcTransport',
      { sender: false },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log(transportParams.error);
          return;
        }

        console.log(transportParams);

        // Create recv transport
        consumerTransport = device.createRecvTransport(transportParams);

        consumerTransport.on(
          'connect',
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Signal local DTLS parameters to the server side transport
              peers.emit('transport_recv_connect', {
                // transportId: consumerTransport.id,
                dtlsParameters,
              });
              // Tell the transport that parameters were transmitted
              callback();
            } catch (err: any) {
              errback(err);
            }
          }
        );

        connectRecvTransport();
      }
    );
  };

  const connectRecvTransport = async () => {
    peers.emit(
      'consume',
      {
        rtpCapabilities: device.rtpCapabilities,
      },
      async ({ params }) => {
        if (params.error) {
          console.log('Cannnot consume');
          return;
        }

        console.log(params);
        consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        const { track } = consumer;

        remoteVideo.current!.srcObject = new MediaStream([track]);

        peers.emit('consumer_resume');
      }
    );
  };

  peers.on('producer_closed', () => {
    // Server notified when producer is closed
    consumerTransport.close();
    consumer.close();
  });
  return (
    <div className="user-unit">
      <div className="video-container">
        <video ref={remoteVideo} className="video" autoPlay={true}></video>
      </div>
      <button onClick={goConsume}>Join Stream</button>
      <div className="current-question"></div>
    </div>
  );
}
