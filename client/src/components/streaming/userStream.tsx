import { useAppSelector } from '@/hooks/reduxHooks';
import {
  type UserStreamStateAction,
  defaultUserStreamState,
  userStreamStateReducer,
} from '@/reducers/userStreamStateReducer';
import {
  useGetOneParticipationByPartIdQuery,
  useGetOneQuizQuestionAnswerQuery,
} from '@/services/backendApi';
import { PeersHostSocketManager } from '@/services/peersSocketManager';
import { peersSocketService } from '@/services/peersSocketService';
import { QuizHostSocketManager } from '@/services/quizHostSocketManager';
import { QuizPlayerSocketManager } from '@/services/quizPlayerSocketManager';
import { quizSocketService } from '@/services/quizSocketService';
import type {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/types/QuizSocketTypes';
import { Participation } from '@/types/Types';
import { QUIZ_BACKGROUND } from '@/utils/images';
import { FontAwesome } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Link } from 'expo-router';
// import * as mediasoupClient from 'mediasoup-client';
import { Device /* type types as mediasoupTypes */ } from 'mediasoup-client';
import type {
  AppData,
  Consumer,
  RtpCapabilities,
  Transport,
} from 'mediasoup-client/lib/types';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type MediaStream, RTCView, registerGlobals } from 'react-native-webrtc';
import PlayerQuestion from '../question/playerQuestion';
import FinalScore from '../quiz/finalScore';
import Winners from '../quiz/winners';

export default function UserStream({ partId }: { partId: string }) {
  // Register Globals for Mediasoup
  registerGlobals();

  const [state, dispatchUserState] = useReducer(
    userStreamStateReducer,
    defaultUserStreamState,
  );
  // const [status, setStatus] = useState({});
  const [quizSocketManager, setQuizSocketManager] =
    useState<QuizPlayerSocketManager | null>(null);

  const {
    data: participation,
    error: errParticipation,
    isLoading,
  } = useGetOneParticipationByPartIdQuery(partId);

  // Fetch quiz details, including questions and answers, for a given participation's QuizId.
  const {
    data: quiz,
    error: quizError,
    isLoading: quizIsLoading,
  } = useGetOneQuizQuestionAnswerQuery(participation?.QuizId || '');

  // const remoteVideo = useRef(null);

  // let device: mediasoupTypes.Device;
  // let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  // let consumerTransport: mediasoupTypes.Transport;
  // let consumer: mediasoupTypes.Consumer;

  useQuizSocketManager(
    quizSocketManager,
    dispatchUserState,
    setQuizSocketManager,
    quiz?.id,
  );

  const { goConsume, mediaStream } = useUserPeersSocketManager();

  useEffect(() => {
    console.log('mediaStream: ', mediaStream);
  }, [mediaStream]);


  // useEffect(() => {
  //   peersSocketService.successListener();
  //   peersSocketService.producerClosedListener(
  //     state.consumerTransportState,
  //     state.consumerState,
  //   );

  //   return () => {
  //     peersSocketService.successListenerOff();
  //     peersSocketService.producerClosedListenerOff();
  //   }

  // }, [state.consumerTransportState, state.consumerState])

  // useEffect(() => {
  //   peersSocketService.successListener();
  //   peersSocketService.producerClosedListener(
  //     state.consumerTransportState,
  //     state.consumerState,
  //   );

  //   return () => {
  //     peersSocketService.successListenerOff();
  //     peersSocketService.producerClosedListenerOff();
  //   }

  // }, [state.consumerTransportState, state.consumerState])

  // useEffect(() => {
  //   console.log('user trigger: ', state.currentQuestionNumber);
  // }, [state.currentQuestionNumber]);
  /*
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
      device
        .load({
          routerRtpCapabilities: rtpCapabilities,
        })
        .then(() => {
          createRecvTransport();
          console.log('Device RTP Capabilities', device.rtpCapabilities);
        });

      // once device loads create transport
    } catch (err) {
      const error = err as Error;

      console.error(error);
      if (error.name === 'UnsupportedError') console.warn('Browser not supported');
    }
  };

  const createRecvTransport = async () => {
    peersSocketService.emitcreateConsumerWebRtcTransport(
      consumerTransport,
      device,
      connectRecvTransport,
    );
  };

  const connectRecvTransport = async (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
  ) => {
    const response = peersSocketService.emitConsume(
      consumerTransport,
      device,
      consumer,
      dispatchUserState,
    );
    dispatchUserState({
      type: 'SET_US_CONSUMER_TS',
      payload: response.consumerTransport,
    });
    dispatchUserState({ type: 'SET_US_CONSUMER_STATE', payload: response.consumer });
    // setConsumerTransportState(response.consumerTransport);
    // setConsumerState(response.consumer);
  };

  */
  const pressableStyle = ({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.btn_join,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.btn_join,
          backgroundColor: '#FF7F50',
        };
  };

  return (
    <View style={{ flex:0.7 }}>
      <RTCView
        streamURL={mediaStream?.toURL()}
        objectFit='cover'
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />
      <View style={styles.unitContainer}>
        <View style={styles.unit}>
          {/* <Link href="/" style={styles.close_btn}>
            <FontAwesome name="close" size={24} color="black" />
          </Link> */}
          {/* <View style={styles.video_container}>
              <Video
                ref={remoteVideo}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={status =>
                  dispatchUserState({ type: 'SET_US_AV_STATUS', payload: status })
                }
              />
            </View> */}
          {state.currentQuestionNumber < 12 ? (
            state.currentQuestionNumber === 11 ? (
              //BUG last question not sent to backend before final score registered
              participation && <FinalScore userParticipation={participation} />
            ) : (
              <View style={styles.question_component_container}>
                {state.quizStarted && (
                  <PlayerQuestion
                    participation={participation}
                    currentQuestionNumber={state.currentQuestionNumber}
                    hidden={state.questionHidden}
                    quiz={quiz}
                    quizError={quizError}
                    quizIsLoading={quizIsLoading}
                  />
                )}
              </View>
            )
          ) : (
            participation?.QuizId && <Winners quizId={participation.QuizId} />
          )}
          {/* <div className="current-question"></div> */}
        </View>
        {/* <Text></Text> */}
        <Pressable
          style={pressableStyle}
          id='join-stream-btn'
          onPress={goConsume}
          disabled={false}
        >
          <Text>
            {state.currentQuestionNumber} {/* Join Stream */}
          </Text>
        </Pressable>
      </View>
      {/* </RTCView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  unitContainer: {
    flex: 1,
    height: '100%',
  },
  unit: {
    // flex: 1,
    height: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  close_btn: {
    // flex: 1,
    // width: 10
  },
  count_down: {},
  video_container: {
    flex: 1,
  },
  video: {},
  question_component_container: {
    // flex: 1,
    height: '100%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  btn_join: {
    zIndex: 100000,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});

const useQuizSocketManager = (
  socketManager: QuizPlayerSocketManager | null,
  dispatch: Dispatch<UserStreamStateAction>,
  setSocketManager: Dispatch<SetStateAction<QuizPlayerSocketManager | null>>,
  quizId: string | undefined,
) => {
  useEffect(() => {
    if (!socketManager) {
      setSocketManager(new QuizPlayerSocketManager(dispatch));
    }

    if (socketManager && quizId) {
      socketManager.successListener(quizId);
      socketManager.playerWinnersListener();
      socketManager.startQuizListener();
      socketManager.startTimerListener();
      socketManager.revealListener();

      return () => {
        socketManager.successListenerOff();
        socketManager.playerWinnersListenerOff();
        socketManager.startQuizListenerOff();
        socketManager.startTimerListenerOff();
        socketManager.revealListenerOff();
        socketManager.disconnect();
      };
    }
  }, [socketManager, quizId, dispatch, setSocketManager]);
};

const useUserPeersSocketManager = () => {
  const [device, setDevice] = useState<Device | null>(null);
  // const [rtpCapabilities, setRtpCapabilities] =
  //   useState<mediasoupTypes.RtpCapabilities | null>(null);
  const [consumerTransport, setConsumerTransport] = useState<Transport | null>(null);
  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [mediasoupSocketManager, setMediasoupSocketManager] =
    useState<PeersHostSocketManager | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!mediasoupSocketManager) {
      const manager = new PeersHostSocketManager();
      setMediasoupSocketManager(manager);
      manager.successListener();

      return () => {
        manager.successListenerOff();
        // mediasoupSocketManager.producerClosedListenerOff();
      };
    }
  }, [mediasoupSocketManager]);

  useEffect(() => {
    if (consumerTransport && consumer && mediasoupSocketManager) {
      mediasoupSocketManager.producerClosedListener(consumerTransport, consumer);
      return () => {
        mediasoupSocketManager.producerClosedListenerOff();
      };
    }
  }, [consumerTransport, consumer, mediasoupSocketManager]);
  // Consume Trigger
  const goConsume = () => {
    !device ? getRtpCapabilities() : createRecvTransport();
    console.log('goConsume');
  };

  const getRtpCapabilities = () => {
    // get router rtp capabilities from server
    if (!mediasoupSocketManager)
      throw new Error('No socket manager when getting rtp capabilities');
    mediasoupSocketManager.emitCreateRoom(createDevice);
  };

  const createDevice = async (rtpCapabilities: RtpCapabilities) => {
    try {
      const newDevice = new Device();
      console.log('Is this working???');

      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

      console.log('Device RTP Capabilities', newDevice.rtpCapabilities);

      setDevice(newDevice);

      createRecvTransport(newDevice);
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

  const createRecvTransport = async (newDevice?: Device) => {
    if (!mediasoupSocketManager)
      throw new Error('No socket manager when creating transport');
    const d = newDevice ? newDevice : device;
    if (!d) throw new Error('No device');
    mediasoupSocketManager.emitCreateConsumerWebRtcTransport(
      setConsumerTransport,
      d,
      connectRecvTransport,
    );
    console.log('Is this working???');
  };

  const connectRecvTransport = async (
    consumerTransport: Transport<AppData>,
    device: Device,
  ) => {
    if (!mediasoupSocketManager)
      throw new Error('No socket manager when connecting transport');

    console.log('connectRecvTransport!:!:"!:":!::!"');
    const response = mediasoupSocketManager.emitConsume(
      consumerTransport,
      device,
      setConsumer,
      setMediaStream,
    );
    // dispatchUserState({
    //   type: 'SET_US_CONSUMER_TS',
    //   payload: response.consumerTransport,
    // });
    // dispatchUserState({ type: 'SET_US_CONSUMER_STATE', payload: response.consumer });
    setConsumerTransport(response.consumerTransport);
    // setConsumerState(response.consumer);
  };

  return {
    goConsume,
    mediaStream,
  };
};
