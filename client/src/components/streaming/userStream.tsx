import { useAppSelector } from '@/hooks/reduxHooks';
import {
  defaultUserStreamState,
  userStreamStateReducer,
} from '@/reducers/userStreamStateReducer';
import { useGetOneParticipationByPartIdQuery } from '@/services/backendApi';
import { peersSocketService } from '@/services/peersSocketService';
import { quizSocketService } from '@/services/quizSocketService';
import { Participation } from '@/types/Types';
import { QUIZ_BACKGROUND } from '@/utils/images';
import { FontAwesome } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Link } from 'expo-router';
import * as mediasoupClient from 'mediasoup-client';
import type { types as mediasoupTypes } from 'mediasoup-client';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import PlayerQuestion from '../question/playerQuestion';
import FinalScore from '../quiz/finalScore';
import Winners from '../quiz/winners';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserStream({ partId }: { partId: string }) {
  // const userId = useAppSelector((state) => state.userIdSlice.value);
  // const currentQuestionNumber = useAppSelector(
  //   (state) => state.questionSlice.value
  // );

  const [state, dispatchUserState] = useReducer(
    userStreamStateReducer,
    defaultUserStreamState,
  );
  // const [quizStarted, setQuizStarted] = useState(false);
  // const [questionHidden, setQuestionHidden] = useState(false);
  // const [trigger, setTrigger] = useState(0);
  // const [consumerTransportState, setConsumerTransportState] =
  //   useState<mediasoupTypes.Transport>({} as mediasoupTypes.Transport);
  // const [consumerState, setConsumerState] = useState<mediasoupTypes.Consumer>(
  //   {} as mediasoupTypes.Consumer,
  // );
  // const [userParticipation, setUserParticipation] = useState<Participation>(
  //   {} as Participation
  // );

  // const [status, setStatus] = useState({});

  const {
    data: participation,
    error: errParticipation,
    isLoading,
  } = useGetOneParticipationByPartIdQuery(partId);

  // const remoteVideo = useRef(null);

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let consumerTransport: mediasoupTypes.Transport;
  let consumer: mediasoupTypes.Consumer;

  // useEffect(() => {
  //   if (!errParticipation) setUserParticipation(participation!)
  // }, [participation])

  // biome-ignore lint: only want listerners to register once
  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.playerWinnersListener(dispatchUserState);
    quizSocketService.startQuizListener(dispatchUserState);
    quizSocketService.startTimerListener(() => {}, dispatchUserState);
    quizSocketService.revealListener(dispatchUserState);
    peersSocketService.successListener();
    peersSocketService.producerClosedListener(
      state.consumerTransportState,
      state.consumerState,
    );
  }, []);

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
    <SafeAreaView>
      <RTCView
        streamURL={state.mediaStream?.toURL()}
        objectFit='cover'
        style={{flex: 1}}
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
            {state.trigger < 11 ? (
              state.trigger === 10 ? (
                //BUG last question not sent to backend before final score registered
                participation && <FinalScore userParticipation={participation} />
              ) : (
                <View style={styles.question_component_container}>
                  {state.quizStarted && (
                    <PlayerQuestion
                      participation={participation}
                      trigger={state.trigger}
                      hidden={state.questionHidden}
                    />
                  )}
                </View>
              )
            ) : (
              participation?.QuizId && <Winners quizId={participation.QuizId} />
            )}
            {/* <div className="current-question"></div> */}
          </View>
          <Pressable
            style={pressableStyle}
            id='join-stream-btn'
            onPress={goConsume}
            disabled={false}
          >
            <Text>Join Stream</Text>
          </Pressable>
        </View>
      {/* </RTCView> */}
    </SafeAreaView>
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
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});
