import { useAppSelector } from '@/hooks/reduxHooks';
import {
  defaultUserStreamState,
  userStreamStateReducer,
} from '@/reducers/userStreamStateReducer';
import { useGetOneParticipationByPartIdQuery, useGetOneQuizQuestionAnswerQuery } from '@/services/backendApi';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';
import PlayerQuestion from '../question/playerQuestion';
import FinalScore from '../quiz/finalScore';
import Winners from '../quiz/winners';

export default function UserStream({ partId }: { partId: string }) {

  const [state, dispatchUserState] = useReducer(
    userStreamStateReducer,
    defaultUserStreamState,
  );
  // const [status, setStatus] = useState({});

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

  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let consumerTransport: mediasoupTypes.Transport;
  let consumer: mediasoupTypes.Consumer;

  useEffect(() => {
    if (quiz?.id) quizSocketService.successListener(quiz.id);
    quizSocketService.playerWinnersListener(dispatchUserState);
    quizSocketService.startQuizListener(dispatchUserState);
    quizSocketService.startTimerListener(() => {}, dispatchUserState);
    quizSocketService.revealListener(dispatchUserState);

    return () => {
      quizSocketService.successListenerOff();
      quizSocketService.playerWinnersListenerOff();
      quizSocketService.startQuizListenerOff();
      quizSocketService.startTimerListenerOff();
      quizSocketService.revealListenerOff();
    }
  }, [quiz]);

  useEffect(() => {
    peersSocketService.successListener();
    peersSocketService.producerClosedListener(
      state.consumerTransportState,
      state.consumerState,
    );

    return () => {
      peersSocketService.successListenerOff();
      peersSocketService.producerClosedListenerOff();
    }

  }, [state.consumerTransportState, state.consumerState])

  // useEffect(() => {
  //   console.log('user trigger: ', state.currentQuestionNumber);
  // }, [state.currentQuestionNumber]);

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
