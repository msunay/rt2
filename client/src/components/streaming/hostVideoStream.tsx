import { incrementQuestionNumber } from '@/features/questionSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  HostVideoStreamState,
  HostVideoStreamStateAction,
  defaultHostVideoStreamState,
  hostVideoStreamStateReducer,
} from '@/reducers/hostVideoStreamStateReducer';
import { QuizBroadcasterManager } from '@/services/quizBroadcasterManager';
import { MediaStreamBroadcaster } from '@/services/mediaStreamBroadcaster';
import { router } from 'expo-router';
import * as mediasoupClient from 'mediasoup-client';
import type { types as mediasoupTypes } from 'mediasoup-client';
import { useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import HostQuestion from '../question/hostQuestion';

// Media stream configuration
const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
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

// Question timer duration
export const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 7000;

// Default encoding parameters for video streaming
const DEFAULT_ENCODING_PARAMS: mediasoupClient.types.AppData = {
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

/**
 * Custom hook for mediasoup WebRTC functionality
 */
function useMediasoup(
  state: HostVideoStreamState,
  dispatchState: React.Dispatch<HostVideoStreamStateAction>,
  streamSocketManager: MediaStreamBroadcaster
) {
  // Device and transport refs to persist across renders
  const deviceRef = useRef<mediasoupTypes.Device>();
  const producerTransportRef = useRef<mediasoupTypes.Transport>();
  const producerRef = useRef<mediasoupTypes.Producer>();
  const paramsRef = useRef<mediasoupClient.types.AppData>(DEFAULT_ENCODING_PARAMS);

  /**
   * Gets local user media stream
   */
  const getLocalStream = useCallback(async () => {
    try {
      if (!state.mediaStream) {
        const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
        streamSuccess(stream);
      }
    } catch (err) {
      console.error('Failed to get media stream:', err);
      Alert.alert('Camera Error', 'Unable to access camera and microphone.');
    }
  }, [state.mediaStream]);

  /**
   * Handles successful stream acquisition
   */
  const streamSuccess = useCallback((mediaStream: MediaStream) => {
    dispatchState({ type: 'SET_HVS_MEDIA_STREAM', payload: mediaStream });

    const track = mediaStream.getVideoTracks()[0];
    paramsRef.current = {
      track,
      ...paramsRef.current,
    };
  }, [dispatchState]);

  /**
   * Start connection process
   */
  const connect = useCallback(() => {
    if (!deviceRef.current) {
      getRtpCapabilities();
    } else {
      createSendTransport();
    }
  }, []);

  /**
   * Get RTP capabilities from server
   */
  const getRtpCapabilities = useCallback(() => {
    streamSocketManager.createRoom(createDevice);
  }, [streamSocketManager]);

  /**
   * Create mediasoup device with router capabilities
   */
  const createDevice = useCallback(async (rtpCapabilities: mediasoupTypes.RtpCapabilities) => {
    try {
      const device = new mediasoupClient.Device();
      await device.load({
        routerRtpCapabilities: rtpCapabilities,
      });

      console.log('Device RTP Capabilities', device.rtpCapabilities);
      deviceRef.current = device;
      createSendTransport();
    } catch (err) {
      console.error('Failed to create device:', err);
      const error = err as Error;
      if (error.name === 'UnsupportedError') {
        Alert.alert('Error', 'Browser not supported for WebRTC.');
      }
    }
  }, []);

  /**
   * Create transport for sending media
   */
  const createSendTransport = useCallback(() => {
    if (!deviceRef.current) {
      console.error('Device not initialized');
      return;
    }

    streamSocketManager.createProducerTransport(
      (transport) => {
        producerTransportRef.current = transport as mediasoupTypes.Transport;
        return connectSendTransport(transport as mediasoupTypes.Transport);
      },
      deviceRef.current,
      connectSendTransport
    );
  }, [streamSocketManager]);

  /**
   * Connect the send transport
   */
  const connectSendTransport = useCallback(async (producerTransport: mediasoupTypes.Transport) => {
    try {
      if (!paramsRef.current.track) {
        console.error('No track available to produce');
        return;
      }

      const producer = await producerTransport.produce(paramsRef.current);
      producerRef.current = producer;

      producer.on('trackended', () => {
        console.log('Track ended');
        if (state.mediaStream) {
          state.mediaStream.getTracks().forEach(track => track.stop());
        }
      });

      producer.on('transportclose', () => {
        console.log('Transport ended');
        if (state.mediaStream) {
          state.mediaStream.getTracks().forEach(track => track.stop());
        }
      });
    } catch (err) {
      console.error('Failed to connect send transport:', err);
      Alert.alert('Connection Error', 'Failed to establish streaming connection.');
    }
  }, [state.mediaStream]);

  /**
   * End streaming and clean up resources
   */
  const endStream = useCallback(() => {
    if (producerRef.current) {
      producerRef.current.close();
    }

    if (producerTransportRef.current) {
      producerTransportRef.current.close();
    }

    if (state.mediaStream) {
      state.mediaStream.getTracks().forEach(track => track.stop());
      dispatchState({ type: 'SET_HVS_MEDIA_STREAM', payload: undefined });
    }

    router.navigate('/');
  }, [state.mediaStream, dispatchState]);

  return {
    getLocalStream,
    connect,
    endStream
  };
}

/**
 * Host video streaming component
 */
export default function HostVideoStream({ quizId }: { quizId: string }) {

  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const currentQuestionNumber = useAppSelector(state => state.questionSlice.value);

  // Local component state
  const [state, dispatchState] = useReducer(
    hostVideoStreamStateReducer,
    defaultHostVideoStreamState,
  );

  // Socket managers
  const quizSocketManager = useMemo(() => new QuizBroadcasterManager(dispatchState), []);
  const streamSocketManager = useMemo(() => new MediaStreamBroadcaster(), []);

  // Initialize mediasoup functionality
  const { getLocalStream, connect, endStream } = useMediasoup(state, dispatchState, streamSocketManager);

  // Set up socket listeners
  useEffect(() => {
    // Set up all quiz host listeners
    quizSocketManager.setupAllListeners(quizId);

    // Set up streaming socket listeners
    streamSocketManager.setupConnectionListener();

    // Get media permissions as soon as component mounts
    getLocalStream().catch(err => {
      console.error('Error getting local stream on mount:', err);
    });

    // Cleanup function
    return () => {
      // Clean up socket listeners
      quizSocketManager.removeAllListeners();
      quizSocketManager.disconnect();

      streamSocketManager.removeConnectionListener();
      streamSocketManager.disconnect();

      // Ensure media streams are stopped
      if (state.mediaStream) {
        state.mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [quizId, quizSocketManager, streamSocketManager, getLocalStream, state.mediaStream]);

  /**
   * Start the quiz
   */
  const startQuiz = useCallback(() => {
    dispatchState({ type: 'SET_HVS_QUIZ_STARTED', payload: true });
    quizSocketManager.startQuiz(quizId);
    dispatch(incrementQuestionNumber());
  }, [dispatch, quizId, quizSocketManager]);

  /**
   * Proceed to next question
   */
  const nextQuestion = useCallback(() => {
    dispatch(incrementQuestionNumber());
    dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    quizSocketManager.nextQuestion(quizId);
    dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });

    // Optional: Add timer for auto-progression if needed
    // if (currentQuestionNumber < 9) {
    //   setTimeout(() => {
    //     // Auto-progress logic
    //   }, QUESTION_TIME + 2000);
    // }
  }, [dispatch, currentQuestionNumber, quizId, quizSocketManager]);

  /**
   * Show winners screen
   */
  const handleWinners = useCallback(() => {
    console.log('Showing winners');
    quizSocketManager.showWinners(quizId);
  }, [quizId, quizSocketManager]);

  /**
   * Button style with pressed state
   */
  const pressableStyle = useCallback(({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.actionButton,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.actionButton,
          backgroundColor: '#FF7F50',
        };
  }, []);

  return (
    <RTCView
      streamURL={state.mediaStream?.toURL()}
      mirror={true}
      objectFit='cover'
      style={styles.rtcView}
    >
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <View style={styles.questionComponentContainer}>
            {state.quizStarted && (
              <HostQuestion
                quizId={quizId}
                trigger={state.trigger}
                hidden={state.questionHidden}
              />
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.quizControls}>
            {state.quizStarted ? (
              currentQuestionNumber === 10 ? (
                <Pressable
                  style={pressableStyle}
                  onPress={() => {
                    handleWinners();
                    dispatch(incrementQuestionNumber());
                  }}
                >
                  <Text style={styles.buttonText}>Reveal Winners</Text>
                </Pressable>
              ) : (
                <Pressable onPress={nextQuestion} style={pressableStyle}>
                  <Text style={styles.buttonText}>Next Question</Text>
                </Pressable>
              )
            ) : (
              <Pressable style={pressableStyle} onPress={startQuiz}>
                <Text style={styles.buttonText}>Start Quiz</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.streamControls}>
            <Pressable style={pressableStyle} onPress={getLocalStream}>
              <Text style={styles.buttonText}>Start Video</Text>
            </Pressable>
            <Pressable style={pressableStyle} onPress={connect}>
              <Text style={styles.buttonText}>Stream</Text>
            </Pressable>
            <Pressable style={pressableStyle} onPress={endStream}>
              <Text style={styles.buttonText}>End Stream</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </RTCView>
  );
}

const styles = StyleSheet.create({
  rtcView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  videoContainer: {
    flex: 1,
  },
  questionComponentContainer: {
    height: 170,
  },
  buttonContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  quizControls: {
    alignItems: 'center',
    marginBottom: 10,
  },
  streamControls: {
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
});