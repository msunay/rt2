// import styles from '@/styles/streaming.module.css';
import React, {
  ReactComponentElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { peersSocketService } from '@/services/peersSocketService';
import { useAppSelector, useAppDispatch } from '@/utils/hooks';
import { incrementQuestionNumber } from '@/features/questionSlice';
import { router } from 'expo-router';
import { quizSocketService, startTimer } from '@/services/quizSocketService';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { Video, VideoProps, VideoState } from 'expo-av';
import HostQuestion from '../question/hostQuestion';
import { QUESTION_TIME } from '@/services/quizSocketService';
import { btnPressStyle } from '@/utils/helpers';

export default function HostStream({ quizId }: { quizId: string }) {
  const currentQuestionNumber = useAppSelector(
    (state) => state.questionSlice.value
  );
  const dispatch = useAppDispatch();

  const [quizStarted, setQuizStarted] = useState(false);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [trigger, setTrigger] = useState(0); 
  const [nextDisabled, setNextDisabled] = useState(false);
  const [startDisabled, setStartDisabled] = useState(false);

  const localVideo = useRef(null);
  const nextQBtn = useRef(null);
  const startBtn = useRef(null);
  // const { push } = useRouter();

  // let device: mediasoupTypes.Device;
  // let producerTransport: mediasoupTypes.Transport;
  // let producer: mediasoupTypes.Producer;
  // let mediaStream: MediaStream;

  useEffect(() => {
    quizSocketService.successListener();
    quizSocketService.startTimerListener(setQuestionHidden);
    quizSocketService.revealAnswerHostListener(setQuestionHidden);
    quizSocketService.hostWinnersListener(setTrigger);
    // peersSocketService.successListener();
  }, []);

  function startQuiz() {
    // startTimer();
    setQuizStarted(true);
    quizSocketService.emitHostStartQuiz();
    dispatch(incrementQuestionNumber());
  }

  function nextQuestion() {
    setQuestionHidden(false);
    if (currentQuestionNumber < 9) {
      setStartDisabled(true);
      setTimeout(() => {
        setNextDisabled(false);
      }, QUESTION_TIME + 2000);
    }
    // document
    //   .querySelectorAll('button[name="a"]')
    //   //@ts-ignore
    //   .forEach((btn) => (btn.disabled = false));
    dispatch(incrementQuestionNumber());
    // document.getElementById('countdown-canvas')!.hidden = false;
    quizSocketService.emitNextQ();
    // startTimer();
    setTrigger((trigger) => trigger + 1);
  }

  function handleWinners() {
    console.log('HANDLE WINNERS TRIGGER');
    quizSocketService.emitShowWinners();
  }

  // const stream = () => {
  //   goConnect();
  // };

  // let params: mediasoupTypes.ProducerOptions = {
  //   encodings: [
  //     {
  //       rid: 'r0',
  //       maxBitrate: 100000,
  //       scalabilityMode: 'S1T3',
  //     },
  //     {
  //       rid: 'r1',
  //       maxBitrate: 300000,
  //       scalabilityMode: 'S1T3',
  //     },
  //     {
  //       rid: 'r2',
  //       maxBitrate: 900000,
  //       scalabilityMode: 'S1T3',
  //     },
  //   ],
  //   codecOptions: {
  //     videoGoogleStartBitrate: 1000,
  //   },
  // };

  // const streamSuccess = (mediaStream: MediaStream) => {
  //   localVideo.current!.source = mediaStream;
  //   const track = mediaStream.getVideoTracks()[0];
  //   params = {
  //     track,
  //     ...params,
  //   };
  // };

  // const getLocalStream = async () => {
  //   navigator.mediaDevices
  //     .getUserMedia({
  //       audio: true,
  //       video: {
  //         width: {
  //           min: 640,
  //           max: 1920,
  //         },
  //         height: {
  //           min: 400,
  //           max: 1080,
  //         },
  //       },
  //     })
  //     .then(streamSuccess)
  //     .catch((err) => console.error(err));
  // };

  // const goConnect = () => {
  //   device === undefined ? getRtpCapabilities() : createSendTransport();
  // };

  // const getRtpCapabilities = () => {
  //   // get router rtp capabilities from server
  //   peersSocketService.emitCreateRoom(createDevice);
  // };

  // const createDevice = async (
  //   rtpCapabilities: mediasoupTypes.RtpCapabilities
  // ) => {
  //   try {
  //     device = new mediasoupClient.Device();
  //     await device
  //       .load({
  //         routerRtpCapabilities: rtpCapabilities,
  //       })
  //       .then(() => {
  //         createSendTransport();
  //         console.log('Device RTP Capabilities', device.rtpCapabilities);
  //       });

  //     // once device loads create transport
  //   } catch (err: any) {
  //     console.error(err);
  //     if (err.name === 'UnsupportedError')
  //       console.warn('Browser not supported');
  //   }
  // };

  // const createSendTransport = () => {
  //   peersSocketService.emitcreateProducerWebRtcTransport(
  //     producerTransport,
  //     device,
  //     connectSendTransport
  //   );
  // };

  // const connectSendTransport = async (
  //   producerTransport: mediasoupTypes.Transport
  // ) => {
  //   console.log('ConnectSendTransport params: ', params);
  //   console.log('ConnectSendTransport producerTransport: ', producerTransport);
  //   producer = await producerTransport.produce(params);

  //   producer.on('trackended', () => {
  //     console.log('Track ended');
  //     mediaStream.getTracks().forEach((track) => track.stop());
  //   });

  //   producer.on('transportclose', () => {
  //     console.log('transport ended');
  //     mediaStream.getTracks().forEach((track) => track.stop());
  //   });
  // };

  // const endStream = () => {
  //   router.navigate('/')
  //   // producer.close();
  //   // producerTransport.close();
  //   // mediaStream.getTracks().forEach((track) => track.stop());
  // };

  const pressableStyle = ({ pressed }: { pressed: boolean }) =>
    btnPressStyle(pressed, ['#ffb296', '#FF7F50'], styles.next_q_btn);

  return (
    <View style={styles.unit}>
      <View style={styles.video_container}>
        {/* <Video
          ref={localVideo}
          style={styles.video}
        ></Video> */}
        <View style={styles.question_component_container}>
          {quizStarted && (
            <HostQuestion
              quizId={quizId}
              trigger={trigger}
              hidden={questionHidden}
            />
          )}
        </View>
      </View>

      <View style={styles.btn_holder}>
        <View style={styles.quiz_controls}>
          {quizStarted ? (
            currentQuestionNumber === 10 ? (
              <Pressable
                style={pressableStyle}
                onPress={() => {
                  handleWinners();
                  dispatch(incrementQuestionNumber());
                }}
                // disabled={disabled}
              >
                <Text style={styles.next_q_btnText}>Reveal Winners</Text>
              </Pressable>
            ) : (
              <Pressable
                ref={nextQBtn}
                onPress={nextQuestion}
                style={pressableStyle}
              >
                <Text style={styles.next_q_btnText}>Next Question</Text>
              </Pressable>
            )
          ) : (
            <Pressable ref={startBtn} style={pressableStyle} onPress={startQuiz}>
              <Text style={styles.next_q_btnText}>Start Quiz</Text>
            </Pressable>
          )}
        </View>
        {/* <button style={styles.stream_btns} onClick={getLocalStream}>
          Start Video
        </button>
        <button style={styles.stream_btns} onClick={stream}>
          Stream
        </button> */}
        {/* <button style={styles.stream_btns} onClick={endStream}>
          End Stream
        </button> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  unit: {},
  close_btn: {},
  count_down: {},
  video_container: {},
  video: {},
  question_component_container: {
    // flex: 1,
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
