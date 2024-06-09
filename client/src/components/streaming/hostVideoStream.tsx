import { incrementQuestionNumber } from '@/features/questionSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  type HostVideoStreamStateAction,
  defaultHostVideoStreamState,
  hostVideoStreamStateReducer,
} from '@/reducers/hostVideoStreamStateReducer';
import { PeersHostSocketManager } from '@/services/peersSocketManager';
// import { peersSocketService } from '@/services/peersSocketService';
import { QuizHostSocketManager } from '@/services/quizHostSocketManager';
import { router } from 'expo-router';
import * as mediasoupClient from 'mediasoup-client';
import type { types as mediasoupTypes } from 'mediasoup-client';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
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

  const [quizSocketManager, setQuizSocketManager] =
    useState<QuizHostSocketManager | null>(null);

  const [mediasoupSocketManager, setMediasoupSocketManager] =
    useState<PeersHostSocketManager | null>(null);

  const nextQBtn = useRef(null);
  const startBtn = useRef(null);
  // const { push } = useRouter();

  useQuizSocketManager(quizSocketManager, dispatchState, setQuizSocketManager, quizId);

  const { endStream, getLocalStream, stream, mediaStream } = useMediasoupSocketManager();

  function startQuiz() {
    dispatchState({ type: 'SET_HVS_QUIZ_STARTED', payload: true });

    if (quizSocketManager) quizSocketManager.emitHostStartQuiz(quizId);
    else console.error('Socket Manager not initialized');

    dispatch(incrementQuestionNumber());
  }

  function nextQuestion() {
    dispatch(incrementQuestionNumber());
    dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });

    if (quizSocketManager) quizSocketManager.emitNextQ(quizId);
    else console.error('Socket Manager not initialized');

    dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });
  }

  function handleWinners() {
    console.log('HANDLE WINNERS TRIGGER');
    if (quizSocketManager) quizSocketManager.emitShowWinners(quizId);
    else console.error('Socket Manager not initialized');
  }

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
        streamURL={mediaStream?.toURL()}
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

const useQuizSocketManager = (
  socketManager: QuizHostSocketManager | null,
  dispatch: Dispatch<HostVideoStreamStateAction>,
  setSocketManager: Dispatch<SetStateAction<QuizHostSocketManager | null>>,
  quizId: string,
) => {
  useEffect(() => {
    if (!socketManager) {
      setSocketManager(new QuizHostSocketManager(dispatch));
    }

    if (socketManager) {
      socketManager.successListener(quizId);
      socketManager.startTimerListener();
      socketManager.revealAnswerHostListener();
      socketManager.hostWinnersListener();

      return () => {
        socketManager.successListenerOff();
        socketManager.startTimerListenerOff();
        socketManager.revealAnswerHostListenerOff();
        socketManager.hostWinnersListenerOff();
        socketManager.disconnect();
      };
    }
  }, [socketManager, quizId, dispatch, setSocketManager]);
};

const useMediasoupSocketManager = () => {
  const [device, setDevice] = useState<mediasoupTypes.Device | null>(null);
  const [producerTransport, setProducerTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [producer, setProducer] = useState<mediasoupTypes.Producer | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [frontFacing, setFrontFacing] = useState<boolean>(true);
  const [socketManager, setSocketManager] = useState<PeersHostSocketManager | null>(null);
  const [params, setParams] = useState<mediasoupClient.types.AppData>({
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
  });

  useEffect(() => {
    if (!socketManager) {
      const manager = new PeersHostSocketManager();
      setSocketManager(manager);
      manager.successListener();

      return () => {
        manager.successListenerOff();
      };
    }
  }, [socketManager]);

  const stream = () => {
    goConnect();
  };

  const streamSuccess = (mediaStream: MediaStream) => {
    if (!mediaStream) throw new Error('No media stream');
    setMediaStream(mediaStream);
    const track = mediaStream.getVideoTracks()[0];

    setParams(prevParams => {
      return {
        ...prevParams,
        track,
      };
    });
  };

  const getLocalStream = async () => {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: {
        facingMode: frontFacing ? 'user' : 'environment',
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

    if (!mediaStream) {
      try {
        const stream = await mediaDevices.getUserMedia(constraints);
        streamSuccess(stream);
      } catch (error) {
        console.error(error);
        throw new Error('Cannot get local stream');
      }
    }
  };

  const goConnect = () => {
    !device ? getRtpCapabilities() : createSendTransport();
  };

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    if (!socketManager) throw new Error('No socket manager');
    socketManager.emitCreateRoom(createDevice);
    // peersSocketService.emitCreateRoom(createDevice);
  };

  const createSendTransport = (newDevice?: mediasoupClient.types.Device) => {
    // if (!producerTransport)
    //   throw new Error('No producer transport');
    // if (!newDevice) throw new Error('No device');
    // if (!device) throw new Error('No device');
    if (!socketManager) throw new Error('No socket manager');
    const d = newDevice ? newDevice : device;
    if (!d) throw new Error('No device');
    socketManager.emitcreateProducerWebRtcTransport(
      // producerTransport,
      setProducerTransport,
      d,
      // newDevice,
      connectSendTransport,
    );
  };

  const createDevice = async (rtpCapabilities: mediasoupTypes.RtpCapabilities) => {
    try {
      const newDevice = new mediasoupClient.Device();

      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

      console.log('Device RTP Capabilities', newDevice.rtpCapabilities);

      setDevice(newDevice);

      createSendTransport(newDevice);
      // if (!device) throw new Error('No device');
      // await device
      //   .load({
      //     routerRtpCapabilities: rtpCapabilities,
      //   })
      //   .then(() => {
      //     createSendTransport();
      //     console.log('Device RTP Capabilities', device.rtpCapabilities);
      //     });

      // once device loads create transport
    } catch (err) {
      console.error(err);
      const error = err as Error;
      if (error.name === 'UnsupportedError') console.warn('Browser not supported');
    }
  };

  const connectSendTransport = async (producerTransport: mediasoupTypes.Transport) => {
    console.log('ConnectSendTransport params: ', params);
    console.log('ConnectSendTransport producerTransport: ', producerTransport);
    const newProducer = await producerTransport.produce(params);

    if (!newProducer) throw new Error('No producer');

    newProducer.on('trackended', () => {
      console.log('Track ended');
      if (mediaStream) {
        mediaStream.getTracks().map(track => track.stop());
      }
    });

    newProducer.on('transportclose', () => {
      console.log('transport ended');
      if (mediaStream) {
        mediaStream.getTracks().map(track => track.stop());
      }
    });
    setProducer(newProducer);
  };

  const endStream = () => {
    router.navigate('/');
    if (!producer || !producerTransport) throw new Error('No producer or transport');
    producer.close();
    producerTransport.close();
    // mediaStream.getTracks().forEach((track) => track.stop());
  };

  return {
    endStream,
    getLocalStream,
    stream,
    mediaStream,
  };
};
