import { incrementQuestionNumber } from '@/features/questionSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  defaultHostVideoStreamState,
  hostVideoStreamStateReducer,
} from '@/reducers/hostVideoStreamStateReducer';
import { peersSocketService } from '@/services/peersSocketService';
import { quizSocketService, startTimer } from '@/services/quizSocketService';
import { QUESTION_TIME } from '@/services/quizSocketService';
import { router } from 'expo-router';
import * as mediasoupClient from 'mediasoup-client';
import type { types as mediasoupTypes } from 'mediasoup-client';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView, mediaDevices, registerGlobals } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import HostQuestion from '../question/hostQuestion';

export default function HostVideoStream({ quizId }: { quizId: string }) {
  // Register Globals for Mediasoup
  registerGlobals();

  const dispatch = useAppDispatch();

  const currentQuestionNumber = useAppSelector(state => state.questionSlice.value);

  const [state, dispatchState] = useReducer(
    hostVideoStreamStateReducer,
    defaultHostVideoStreamState,
  );
  // const [quizStarted, setQuizStarted] = useState(false);
  // const [questionHidden, setQuestionHidden] = useState(false);
  // const [trigger, setTrigger] = useState(0);
  // const [nextDisabled, setNextDisabled] = useState(false);
  // const [startDisabled, setStartDisabled] = useState(false);
  // const [mediaStream, setMediaStream] = useState<MediaStream>();

  const nextQBtn = useRef(null);
  const startBtn = useRef(null);
  // const { push } = useRouter();

  let device: mediasoupTypes.Device;
  let producerTransport: mediasoupClient.types.Transport;
  let producer: mediasoupTypes.Producer;

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.startTimerListener(dispatchState);
    quizSocketService.revealAnswerHostListener(dispatchState);
    quizSocketService.hostWinnersListener(dispatchState);
    peersSocketService.successListener();
  }, []);

  function startQuiz() {
    dispatchState({ type: 'SET_HVS_QUIZ_STARTED', payload: true });
    // setQuizStarted(true);
    quizSocketService.emitHostStartQuiz();
    dispatch(incrementQuestionNumber());
  }

  function nextQuestion() {
    // setQuestionHidden(false);

    // if (currentQuestionNumber < 9) {
    //   setTimeout(() => {

    //   }, QUESTION_TIME + 2000);
    // }
    dispatch(incrementQuestionNumber());
    dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    quizSocketService.emitNextQ();
    dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });
    // setTrigger(trigger => trigger + 1);
  }

  function handleWinners() {
    console.log('HANDLE WINNERS TRIGGER');
    quizSocketService.emitShowWinners();
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
        facingMode: 'user',
        width: {
          min: 640,
          max: 1920,
        },
        height: {
          min: 400,
          max: 1080,
        },
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
    <RTCView
      streamURL={state.mediaStream?.toURL()}
      mirror={true}
      objectFit='cover'
      style={{ flex: 1 }}
    >
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
              currentQuestionNumber === 10 ? (
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
          <Pressable style={pressableStyle} onPress={getLocalStream}>
            <Text>Start Video</Text>
          </Pressable>
          <Pressable style={pressableStyle} onPress={stream}>
            <Text>Stream</Text>
          </Pressable>
          <Pressable style={pressableStyle} onPress={endStream}>
            <Text>End Stream</Text>
          </Pressable>
        </View>
      </View>
    </RTCView>
  );
}

const styles = StyleSheet.create({
  unit: {
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
