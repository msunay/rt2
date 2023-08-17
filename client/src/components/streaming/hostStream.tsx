'use client';

import React, { useRef } from 'react';
import { ClientToServerEvents, ServerToClientEvents } from '@/app/PeerSocketTypes';
import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';

export default function HostStream() {

  const localVideo = useRef<HTMLVideoElement>(null);

  const peers: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    'http://localhost:3001/mediasoup'
  );

  peers.on('connection_success', ({ socketId, producerAlreadyExists }) => {
    console.log(socketId, producerAlreadyExists);
  });

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let producerTransport: mediasoupTypes.Transport;
  let producer: mediasoupTypes.Producer;
  let mediaStream: MediaStream;
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

  const stream = () => {
    goConnect()
  }
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
        streamSuccess(mediaStream)
      })
      .catch((err) => console.error(err));
  };

  const goConnect = () => {
    device === undefined ? getRtpCapabilities() : createSendTransport()
  }

  const createDevice = async () => {
    try {
      device = new mediasoupClient.Device();

      await device.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      console.log('Device RTP Capabilities', device.rtpCapabilities);

      // once device loads create transport
      createSendTransport()
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
      createDevice()

    });
  };

  const createSendTransport = () => {
    peers.emit('createWebRtcTransport', { sender: true }, ({ transportParams }) => {
      // if (sendTransportParams.error) {
      //   console.log(sendTransportParams.error);
      //   return;
      // }
      console.log(transportParams);

      producerTransport = device.createSendTransport(transportParams);

      producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          // Singnal local DTLS parameters to the server side transport
          peers.emit('transport_connect', {
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
          peers.emit('transport_produce', {
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

      connectSendTransport()
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

  const endStream = () => {
    producer.close()
    producerTransport.close()
    mediaStream.getTracks().forEach(track => track.stop())
  }

  return (
    <>
      <div className="host-unit">
        <div className="video-container" >
          <video
            ref={localVideo}
            className="video"
            autoPlay={true}
          ></video>
        </div>
        <div className='next-q-preview'>

        </div>
        <div className='quiz-controls'>
          <button className='next-q-btn' onClick={getLocalStream}>Next Question</button>
        </div>
        <div className='stream-controls'>
          <button className='stream-btns' onClick={getLocalStream}>Start Video</button>
          <button className='stream-btns' onClick={stream}>Stream</button>
          <button className='stream-btns' onClick={endStream}>End Stream</button>
        </div>
      </div>

    </>
  )
}
