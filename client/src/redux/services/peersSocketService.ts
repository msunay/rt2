import { Socket, io } from 'socket.io-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/Types/PeerSocketTypes';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/';
const peers: Socket<PeersServerToClientEvents, PeersClientToServerEvents> = io(
  `${BASE_URL}mediasoup`
);

interface parameters {
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}
type callback = ({ id }: { id: string }) => void;

export const peersSocketService = {
  successListener: () =>
    peers.on('connection_success', ({ socketId, producerAlreadyExists }) => {
      console.log('peers socket connected :', socketId, producerAlreadyExists);
    }),

  emitCreateRoom: (
    createDevice: (
      rtpCapabilities: mediasoupTypes.RtpCapabilities
    ) => Promise<void>
  ) => {
    peers.emit(
      'create_room',
      (data: { rtpCapabilities: mediasoupTypes.RtpCapabilities }) => {
        console.log(`Router RTP Capabilities: ${data.rtpCapabilities}`);
        //assign to local variable
        createDevice(data.rtpCapabilities);
      }
    );
  },

  emitcreateWebRtcTransport: (
    producerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    connectSendTransport: (
      producerTransport: mediasoupTypes.Transport
    ) => Promise<void>
  ) => {
    peers.emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log(transportParams.error);
          return;
        }
        console.log('transportParams: ', transportParams);

        producerTransport = device.createSendTransport(transportParams);

        console.log(
          'CreateSendTransport producerTransport: ',
          producerTransport
        );

        producerTransport.on(
          'connect',
          async (
            {
              dtlsParameters,
            }: { dtlsParameters: mediasoupTypes.DtlsParameters },
            callback: () => void,
            errback: (error: Error) => void
          ) => {
            try {
              // Singnal local DTLS parameters to the server side transport
              peers.emit('transport_connect', {
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
          async (
            parameters: parameters,
            callback: callback,
            errback: (error: Error) => void
          ) => {
            console.log('producer.on produce params: ', parameters);

            try {
              peers.emit(
                'transport_produce',
                {
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
        connectSendTransport(producerTransport);
      }
    );
  },
};
