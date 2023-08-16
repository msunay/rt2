'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './mediasoup.module.css';
import { ClientToServerEvents, ServerToClientEvents } from '../Types';
import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';

function stream() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const [isProducer, setIsProducer] = useState<boolean>(false);

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    'http://localhost:3001/mediasoup'
  );

  socket.on('connection_success', ({ socketId, producerAlreadyExists }) => {
    console.log(socketId, producerAlreadyExists);
  });

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let producerTransport: mediasoupTypes.Transport;
  let consumerTransport: mediasoupTypes.Transport;
  let producer: mediasoupTypes.Producer;
  let consumer: mediasoupTypes.Consumer;

  let params: mediasoupTypes.ProducerOptions = {
    encodings:
    [
      {
        rid: 'r0',
        maxBitrate: 100000,
        scalabilityMode: 'S1T3'
      },
      {
        rid: 'r1',
        maxBitrate: 300000,
        scalabilityMode: 'S1T3'
      },
      {
        rid: 'r2',
        maxBitrate: 900000,
        scalabilityMode: 'S1T3'
      }
    ],
    codecOptions:
    {
      videoGoogleStartBitrate: 1000
    }
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
    await navigator.mediaDevices
      .getUserMedia({
        audio: false,
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
      .then((mediaStream) => streamSuccess(mediaStream))
      .catch((err) => console.error(err));
  };

  const goConnect = (producerOrConsumer) => {
    setIsProducer(producerOrConsumer)
    getRtpCapabilities()
  }

  const createDevice = async () => {
    try {
      device = new mediasoupClient.Device();

      await device.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      console.log('RTP Capabilities', device.rtpCapabilities);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'UnsupportedError')
        console.warn('Browser not supported');
    }
  };

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    // send
    socket.emit('create_room', (data: any) => {
      console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);

      rtpCapabilities = data.rtpCapabilities;
    });
  };

  const createSendTransport = () => {
    socket.emit('createWebRtcTransport', { sender: true }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }
      console.log(params);

      producerTransport = device.createSendTransport(params);

      producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          // Singnal local DTLS parameters to the server side transport
          socket.emit('transport_connect', {
            // transportId: producerTransport.id,
            dtlsParameters: dtlsParameters
          })

          // Tell the transport that parameters were transmitted.
          callback()
        } catch (error: any) {
          errback(error);
        }
      })

      producerTransport.on('produce', async (parameters, callback, errback) => {
        console.log(parameters);

        try {
          socket.emit('transport_produce', {
            // transportId: producerTransport.id,
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData
          }, ({ id }) => {
            // Tell the transport that parameters were transmitted and provide it with the
            // server side producers's id
            callback({ id })
          })
        } catch (err: any) {
          errback(err);
        }
      })
    })
  }

  const connectSendTransport = async () => {
    console.log(params);
    producer = await producerTransport.produce(params);

    producer.on('trackended', () => {
      console.log('Track ended');

      // Close video track

    })

    producer.on('transportclose', () => {
      console.log('transport ended');
      // Close video track
    })
  }

  const createRecvTransport = async () => {
    socket.emit('createWebRtcTransport', { sender: false }, ({params}) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      console.log(params);

      // Create recv transport
      consumerTransport = device.createRecvTransport(params)

      consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          // Signal local DTLS parameters to the server side transport
          socket.emit('transport_recv_connect', {
            // transportId: consumerTransport.id,
            dtlsParameters
          })

          // Tell the transport that parameters were transmitted
          callback()
        } catch (err: any) {
          errback(err)
        }
      })
    })
  }

  const connectRecvTransport = async () => {
    socket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities
    }, async ({ params }) => {
      if (params.error) {
        console.log('Cannnot consume');
        return;
      }

      console.log(params);
      consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters
      })

      const { track } = consumer;

      remoteVideo.current!.srcObject = new MediaStream([track])

      socket.emit('consumer_resume')
    })
  }
  return (
    <main>
      <div id="video">
        <table>
          <thead>
            <tr>
              <th>Local Video</th>
              <th>Remote Video</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.tr}>
              <td>
                <div id="sharedBtns" className={styles.sharedBtns}>
                  <video
                    ref={localVideo}
                    id="localVideo"
                    autoPlay={true}
                    className={styles.video}
                  ></video>
                </div>
              </td>
              <td>
                <div id="sharedBtns" className={styles.sharedBtns}>
                  <video
                    ref={remoteVideo}
                    id="remoteVideo"
                    autoPlay={true}
                    className={styles.video}
                  ></video>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div id="sharedBtns" className={styles.sharedBtns}>
                  <button
                    id="btnLocalVideo"
                    className={styles.button}
                    onClick={getLocalStream}
                  >
                    1. Get Local Video
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div id="sharedBtns" className={styles.sharedBtns}>
                  <button
                    id="btnRtpCapabilities"
                    className={styles.button}
                    onClick={getRtpCapabilities}
                  >
                    2. Get Rtp Capabilities
                  </button>
                  <br />
                  <button
                    id="btnDevice"
                    className={styles.button}
                    onClick={createDevice}
                  >
                    3. Create Device
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div id="sharedBtns" className={styles.sharedBtns}>
                  <button
                    id="btnCreateSendTransport"
                    className={styles.button}
                    onClick={createSendTransport}
                  >
                    4. Create Send Transport
                  </button>
                  <br />
                  <button
                    id="btnConnectSendTransport"
                    className={styles.button}
                    onClick={connectSendTransport}
                  >
                    5. Connect Send Transport & Produce
                  </button>
                </div>
              </td>
              <td>
                <div id="sharedBtns" className={styles.sharedBtns}>
                  <button
                    id="btnRecvSendTransport"
                    className={styles.button}
                    onClick={createRecvTransport}
                  >
                    6. Create Recv Transport
                  </button>
                  <br />
                  <button
                    id="btnConnectRecvTransport"
                    className={styles.button}
                    onClick={connectRecvTransport}
                  >
                    7. Connect Recv Transport & Consume
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default stream;
