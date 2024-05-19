import { incrementQuestionNumber } from '@/features/questionSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  defaultHostVideoStreamState,
  hostVideoStreamStateReducer,
} from '@/reducers/hostVideoStreamStateReducer';
import { peersSocketService } from '@/services/peersSocketService';
import { quizSocketService } from '@/services/quizSocketService';
import { router } from 'expo-router';
import * as mediasoupClient from 'mediasoup-client';
import type { types as mediasoupTypes } from 'mediasoup-client';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView, mediaDevices, registerGlobals } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import HostQuestion from '../question/hostQuestion';
import SpeedDialComponent from './speedDial';

export default function HostVideoStream({ quizId }: { quizId: string }) {
  // Register Globals for Mediasoup
  registerGlobals();

  const dispatch = useAppDispatch();

  const currentQuestionNumber = useAppSelector(state => state.questionSlice.value);

  const [state, dispatchState] = useReducer(
    hostVideoStreamStateReducer,
    defaultHostVideoStreamState,
  );

  const nextQBtn = useRef(null);
  const startBtn = useRef(null);
  // const { push } = useRouter();

  let device: mediasoupTypes.Device;
  let producerTransport: mediasoupClient.types.Transport;
  let producer: mediasoupTypes.Producer;

  useEffect(() => {
    quizSocketService.successListener(quizId);
    quizSocketService.startTimerListener(dispatchState);
    quizSocketService.revealAnswerHostListener(dispatchState);
    quizSocketService.hostWinnersListener(dispatchState);

    return () => {
      quizSocketService.successListenerOff();
      quizSocketService.startTimerListenerOff();
      quizSocketService.revealAnswerHostListenerOff();
      quizSocketService.hostWinnersListenerOff();
    };
  }, [quizId]);

  useEffect(() => {
    peersSocketService.successListener();

    return () => {
      peersSocketService.successListenerOff();
    };
  }, [])

  function startQuiz() {
    dispatchState({ type: 'SET_HVS_QUIZ_STARTED', payload: true });
    quizSocketService.emitHostStartQuiz(quizId);
    dispatch(incrementQuestionNumber());
  }

  function nextQuestion() {
    dispatch(incrementQuestionNumber());
    dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    quizSocketService.emitNextQ(quizId);
    dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });
  }

  function handleWinners() {
    console.log('HANDLE WINNERS TRIGGER');
    quizSocketService.emitShowWinners(quizId);
  }

  const stream = () => {
    goConnect();
  };

  let params: mediasoupClient.types.AppData = {
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
    dispatchState({ type: 'SET_HVS_MEDIA_STREAM', payload: mediaStream });
    // setMediaStream(mediaStream);
    const track = mediaStream.getVideoTracks()[0];

    params = {
      track,
      ...params,
    };
  };

  const getLocalStream = async () => {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: {
        facingMode: state.frontFacing ? 'user' : 'environment',
        width: {
          min: 1280,
          max: 1920,
        },
        height: {
          min: 720,
          max: 1080,
        },
        frameRate: 30,
      },
    };

    if (!state.mediaStream) {
      mediaDevices
        .getUserMedia(constraints)
        .then(s => {
          streamSuccess(s);
        })
        .catch(err => console.error(err));
    }
  };

  const goConnect = () => {
    device === undefined ? getRtpCapabilities() : createSendTransport();
  };

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    peersSocketService.emitCreateRoom(createDevice);
  };

  const createDevice = async (rtpCapabilities: mediasoupTypes.RtpCapabilities) => {
    try {
      device = new mediasoupClient.Device();
      await device
        .load({
          routerRtpCapabilities: rtpCapabilities,
        })
        .then(() => {
          createSendTransport();
          console.log('Device RTP Capabilities', device.rtpCapabilities);
        });

      // once device loads create transport
    } catch (err) {
      console.error(err);
      const error = err as Error;
      if (error.name === 'UnsupportedError') console.warn('Browser not supported');
    }
  };

  const createSendTransport = () => {
    peersSocketService.emitcreateProducerWebRtcTransport(
      producerTransport,
      device,
      connectSendTransport,
    );
  };

  const connectSendTransport = async (producerTransport: mediasoupTypes.Transport) => {
    console.log('ConnectSendTransport params: ', params);
    console.log('ConnectSendTransport producerTransport: ', producerTransport);
    producer = await producerTransport.produce(params);

    producer.on('trackended', () => {
      console.log('Track ended');
      if (state.mediaStream) {
        state.mediaStream.getTracks().map(track => track.stop());
      }
    });

    producer.on('transportclose', () => {
      console.log('transport ended');
      if (state.mediaStream) {
        state.mediaStream.getTracks().map(track => track.stop());
      }
    });
  };

  const endStream = () => {
    router.navigate('/');
    // producer.close();
    // producerTransport.close();
    // mediaStream.getTracks().forEach((track) => track.stop());
  };

  const pressableStyle = ({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.next_q_btn,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.next_q_btn,
          backgroundColor: '#FF7F50',
        };
  };

  return (
    <View style={{ flex: 1 }}>
      <RTCView
        streamURL={state.mediaStream?.toURL()}
        mirror={state.frontFacing}
        objectFit='cover'
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />
      <View style={styles.unit}>
        <View style={styles.video_container}>
          <View style={styles.question_component_container}>
            {state.quizStarted && (
              <HostQuestion
                quizId={quizId}
                trigger={state.trigger}
                hidden={state.questionHidden}
              />
            )}
          </View>
        </View>

        <View style={styles.btn_holder}>
          <View style={styles.quiz_controls}>
            {state.quizStarted ? (
              currentQuestionNumber > 10 ? null : currentQuestionNumber === 10 ? (
                <Pressable
                  style={pressableStyle}
                  onPress={() => {
                    handleWinners();
                    dispatch(incrementQuestionNumber());
                  }}
                >
                  <Text style={styles.next_q_btnText}>Reveal Winners</Text>
                </Pressable>
              ) : (
                <Pressable ref={nextQBtn} onPress={nextQuestion} style={pressableStyle}>
                  <Text style={styles.next_q_btnText}>Next Question</Text>
                </Pressable>
              )
            ) : (
              <Pressable ref={startBtn} style={pressableStyle} onPress={startQuiz}>
                <Text style={styles.next_q_btnText}>Start Quiz</Text>
              </Pressable>
            )}
          </View>
        </View>
        <SpeedDialComponent
          state={state}
          dispatchState={dispatchState}
          getLocalStream={getLocalStream}
          stream={stream}
          endStream={endStream}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  unit: {
    flex: 1,
    // borderWidth: 1,
    justifyContent: 'flex-end',
  },
  close_btn: {},
  count_down: {},
  video_container: {},
  video: {},
  question_component_container: {
    height: 170,
  },
  btn_join: {},
  btn_holder: {
    alignSelf: 'center',
  },
  quiz_controls: {
    // flex: 1,
    // height: 85,
    // width: '100%',
    // justifyContent: 'space-around',
    // alignItems: 'center',
    // alignContent: 'flex-end',
    // box-sizing: border-box,
    // padding: 15px 20px,
  },
  next_q_btn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  next_q_btnText: {
    fontFamily: 'Nunito-Bold',
  },
  stream_btns: {},
});
