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
import { MediaStreamBroadcaster } from '@/services/mediaStreamBroadcaster';
import { QuizParticipantManager } from '@/services/quizParticipantManager';
import { Device } from 'mediasoup-client';
import type {
  AppData,
  Consumer,
  RtpCapabilities,
  Transport,
} from 'mediasoup-client/lib/types';
import {
  useEffect,
  useReducer,
  useState,
  useCallback,
  useMemo
} from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { type MediaStream, RTCView, registerGlobals } from 'react-native-webrtc';
import PlayerQuestion from '../question/playerQuestion';
import FinalScore from '../quiz/finalScore';
import Winners from '../quiz/winners';

/**
 * Custom hook for managing quiz socket connections
 */
function useQuizSocketManager(
  dispatch: React.Dispatch<UserStreamStateAction>,
  quizId?: string
) {
  // Create socket manager
  const quizSocketManager = useMemo(
    () => quizId ? new QuizParticipantManager(dispatch) : null,
    [dispatch, quizId]
  );

  // Set up and clean up listeners
  useEffect(() => {
    if (!quizSocketManager || !quizId) return;

    // Set up all listeners
    quizSocketManager.setupAllListeners(quizId);

    // Clean up function
    return () => {
      quizSocketManager.removeAllListeners();
      quizSocketManager.disconnect();
    };
  }, [quizSocketManager, quizId]);

  return quizSocketManager;
}

/**
 * Custom hook for managing MediaSoup WebRTC connections
 */
function useMediaStreamManager() {
  const [device, setDevice] = useState<Device | null>(null);
  const [consumerTransport, setConsumerTransport] = useState<Transport | null>(null);
  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // Create socket manager
  const mediaStreamManager = useMemo(() => new MediaStreamBroadcaster(), []);

  // Set up connection listener
  useEffect(() => {
    mediaStreamManager.setupConnectionListener();

    return () => {
      mediaStreamManager.removeConnectionListener();
      mediaStreamManager.disconnect();
    };
  }, [mediaStreamManager]);

  // Set up producer closed listener when consumer and transport are available
  useEffect(() => {
    if (!consumerTransport || !consumer) return;
    
    mediaStreamManager.setupProducerClosedListener(consumerTransport, consumer);
    
    return () => {
      mediaStreamManager.removeProducerClosedListener();
    };
  }, [consumerTransport, consumer, mediaStreamManager]);

  /**
   * Start the consumption process
   */
  const startConsuming = useCallback(() => {
    if (!device) {
      // Get RTP capabilities if no device exists
      try {
        mediaStreamManager.createRoom(createDevice);
      } catch (err) {
        console.error('Error getting RTP capabilities:', err);
        Alert.alert('Connection Error', 'Failed to connect to stream');
      }
    } else {
      // Create receive transport if device exists
      createReceiveTransport();
    }
  }, [device, mediaStreamManager]);

  /**
   * Create a MediaSoup device with received RTP capabilities
   */
  const createDevice = useCallback(async (rtpCapabilities: RtpCapabilities) => {
    try {
      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
      
      console.log('Device RTP Capabilities', newDevice.rtpCapabilities);
      setDevice(newDevice);
      
      // Automatically create transport once device is ready
      createReceiveTransport(newDevice);
    } catch (err) {
      console.error('Error creating device:', err);
      const error = err as Error;
      if (error.name === 'UnsupportedError') {
        Alert.alert('Error', 'Your device doesn\'t support WebRTC');
      } else {
        Alert.alert('Connection Error', 'Failed to set up stream connection');
      }
    }
  }, []);

  /**
   * Create a WebRTC transport for receiving media
   */
  const createReceiveTransport = useCallback((newDevice?: Device) => {
    try {
      const currentDevice = newDevice || device;
      if (!currentDevice) {
        throw new Error('No device available');
      }
      
      mediaStreamManager.createConsumerTransport(
        setConsumerTransport,
        currentDevice,
        connectReceiveTransport
      );
    } catch (err) {
      console.error('Error creating receive transport:', err);
      Alert.alert('Connection Error', 'Failed to establish streaming connection');
    }
  }, [device, mediaStreamManager]);

  /**
   * Connect the receive transport and start consuming media
   */
  const connectReceiveTransport = useCallback(async (
    transport: Transport<AppData>,
    device: Device
  ) => {
    try {
      mediaStreamManager.consume(
        transport,
        device,
        setConsumer,
        setMediaStream
      );
    } catch (err) {
      console.error('Error connecting receive transport:', err);
      Alert.alert('Connection Error', 'Failed to connect to stream');
    }
  }, [mediaStreamManager]);

  return {
    startConsuming,
    mediaStream
  };
}

/**
 * User stream component for quiz participants
 */
export default function UserStream({ partId }: { partId: string }) {
  // Register WebRTC globals
  registerGlobals();

  // Component state
  const [state, dispatchUserState] = useReducer(
    userStreamStateReducer,
    defaultUserStreamState
  );

  // Fetch participation data
  const {
    data: participation,
    error: participationError,
    isLoading: participationLoading
  } = useGetOneParticipationByPartIdQuery(partId);

  // Fetch quiz details based on participation data
  const {
    data: quiz,
    error: quizError,
    isLoading: quizLoading
  } = useGetOneQuizQuestionAnswerQuery(participation?.QuizId || '');

  // Set up socket managers
  const quizSocketManager = useQuizSocketManager(dispatchUserState, participation?.QuizId);
  const { startConsuming, mediaStream } = useMediaStreamManager();

  // Monitor media stream changes
  useEffect(() => {
    if (mediaStream) {
      console.log('Media stream connected');
    }
  }, [mediaStream]);

  // Handle participation fetch errors
  useEffect(() => {
    if (participationError) {
      console.error('Error fetching participation:', participationError);
      Alert.alert('Error', 'Could not load your participation data');
    }
  }, [participationError]);

  // Button style with pressed state
  const pressableStyle = useCallback(({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.btnJoin,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.btnJoin,
          backgroundColor: '#FF7F50',
        };
  }, []);

  // Render loading state
  if (participationLoading || quizLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Determine what content to show based on question number
  const renderContent = () => {
    if (state.currentQuestionNumber < 12) {
      if (state.currentQuestionNumber === 11) {
        // Show final score
        return participation ? (
          <FinalScore userParticipation={participation} />
        ) : (
          <Text style={styles.errorText}>Participation data unavailable</Text>
        );
      } else {
        // Show current question
        return state.quizStarted ? (
          <PlayerQuestion
            participation={participation}
            currentQuestionNumber={state.currentQuestionNumber}
            hidden={state.questionHidden}
            quiz={quiz}
            quizError={quizError}
            quizIsLoading={quizLoading}
          />
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Waiting for quiz to start...</Text>
          </View>
        );
      }
    } else {
      // Show winners
      return participation?.QuizId ? (
        <Winners quizId={participation.QuizId} />
      ) : (
        <Text style={styles.errorText}>Quiz data unavailable</Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Remote video stream */}
      {mediaStream && (
        <RTCView
          streamURL={mediaStream.toURL()}
          objectFit="cover"
          style={styles.remoteVideo}
        />
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.questionContainer}>
          {renderContent()}
        </View>
        
        <Pressable
          style={pressableStyle}
          onPress={startConsuming}
          accessibilityLabel="Join stream"
        >
          <Text style={styles.buttonText}>
            {mediaStream ? 'Connected' : 'Join Stream'}
          </Text>
        </Pressable>
        
        {__DEV__ && (
          <Text style={styles.debugText}>
            Question: {state.currentQuestionNumber}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  remoteVideo: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  questionContainer: {
    flex: 1,
    marginBottom: 16,
  },
  btnJoin: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200,
    borderRadius: 10,
    marginTop: 10,
    zIndex: 10,
  },
  buttonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#fff',
  },
  loadingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    textAlign: 'center',
  },
  debugText: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    fontSize: 12,
    color: 'gray',
  }
});