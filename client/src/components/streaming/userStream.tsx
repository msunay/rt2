import { useAppSelector } from '@/utils/hooks';
import { useEffect, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Participation } from '@/types/Types';
import { quizSocketService } from '@/services/quizSocketService';
import { peersSocketService } from '@/services/peersSocketService';
import { useGetOneParticipationByPartIdQuery } from '@/services/backendApi';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import PlayerQuestion from '../question/playerQuestion';
import { QUIZ_BACKGROUND } from '@/utils/images';
import FinalScore from '../quiz/finalScore';

export default function UserStream({ partId }: { partId: string }) {
  // const userId = useAppSelector((state) => state.userIdSlice.value);
  // const currentQuestionNumber = useAppSelector(
  //   (state) => state.questionSlice.value
  // );
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0); // BUG not being updated or passed down properly
  const [consumerTransportState, setConsumerTransportState] =
    useState<mediasoupTypes.Transport>({} as mediasoupTypes.Transport);
  const [consumerState, setConsumerState] = useState<mediasoupTypes.Consumer>(
    {} as mediasoupTypes.Consumer
  );
  // const [userParticipation, setUserParticipation] = useState<Participation>(
  //   {} as Participation
  // );

  const [status, setStatus] = useState({});

  const {
    data: participation,
    error: errParticipation,
    isLoading,
  } = useGetOneParticipationByPartIdQuery(partId);

  const remoteVideo = useRef(null);
  /*
  let device: mediasoupTypes.Device;
  let rtpCapabilities: mediasoupTypes.RtpCapabilities;
  let consumerTransport: mediasoupTypes.Transport;
  let consumer: mediasoupTypes.Consumer;
*/
  // useEffect(() => {
  //   if (!errParticipation) setUserParticipation(participation!)
  // }, [participation])

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.playerWinnersListener(setTrigger);
    quizSocketService.startQuizListener(setQuizStarted);
    quizSocketService.startTimerListener(setQuestionHidden);
    quizSocketService.revealListener(setQuestionHidden, setTrigger);
    // peersSocketService.successListener();
    // peersSocketService.producerClosedListener(
    //   consumerTransportState,
    //   consumerState
    // );
  }, []);
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

  const createDevice = async (
    rtpCapabilities: mediasoupTypes.RtpCapabilities
  ) => {
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
    } catch (err: any) {
      console.error(err);
      if (err.name === 'UnsupportedError')
        console.warn('Browser not supported');
    }
  };

  const createRecvTransport = async () => {
    peersSocketService.emitcreateConsumerWebRtcTransport(
      consumerTransport,
      device,
      connectRecvTransport
    );
  };

  const connectRecvTransport = async (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device
  ) => {
    const response = peersSocketService.emitConsume(
      consumerTransport,
      device,
      consumer,
      remoteVideo
    );
    setConsumerTransportState(response.consumerTransport);
    setConsumerState(response.consumer);
  };
*/
  return (
    <View>
      <View style={styles.unit}>
        {/* <Link href="/" style={styles.close_btn}>
          <FontAwesome name="close" size={24} color="black" />
        </Link> */}
        <View style={styles.video_container}>
          <Video
            ref={remoteVideo}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
        </View>
        {trigger < 11 ? (
          trigger === 10 ? (
            <FinalScore userParticipation={participation!} />
          ) : (
            <View style={styles.question_component_container}>
              {quizStarted && (
                <PlayerQuestion
                  participation={participation}
                  trigger={trigger}
                  hidden={questionHidden}
                />
              )}
            </View>
          )
        ) : (
          <>
            {/* <Winners quizId={participation.QuizId!} partId={partId} /> */}
          </>
        )}

        {/* <div className="current-question"></div> */}
      </View>
      {/* <Pressable
        style={styles.btn_join}
        id="join-stream-btn"
        onPress={goConsume}
        disabled={false}
      >
        <Text>Join Stream</Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  unit: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  close_btn: {
    // flex: 1,
    // width: 10
  },
  count_down: {},
  video_container: {},
  video: {},
  question_component_container: {
    // flex: 1,
    height: '60%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  btn_join: {},
});
