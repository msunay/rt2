import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { Alert } from 'react-native';
import { Device } from 'mediasoup-client';
import type { 
  AppData,
  Consumer,
  RtpCapabilities,
  Transport
} from 'mediasoup-client/lib/types';
import type { MediaStream } from 'react-native-webrtc';
import type { Dispatch, SetStateAction } from 'react';

// Import actions from both slices
import {
  setQuizStarted,
  setQuestionHidden,
  incrementQuestionNumber,
  incrementTrigger,
  setQuizId
} from '@/features/quizSlice';

import {
  setConsumerTransport,
  setConsumer,
  setMediaStream,
  setIsConnecting,
  setConnectionError
} from '@/features/mediaStreamSlice';

// Import socket managers
import { QuizParticipantManager } from '@/services/quizParticipantManager';
import { MediaStreamBroadcaster } from '@/services/mediaStreamBroadcaster';

/**
 * Custom hook to map legacy action types to Redux actions
 * Used to bridge between socket managers and Redux
 */
export function useLegacyActionMapper() {
  const dispatch = useAppDispatch();
  
  const dispatchAction = useCallback((action: { type: string; payload?: any }) => {
    // Map the userStreamStateReducer actions to Redux actions
    switch (action.type) {
      case 'SET_US_Q_HIDDEN':
        dispatch(setQuestionHidden(action.payload));
        break;
      case 'SET_US_QUIZ_STARTED':
        dispatch(setQuizStarted(action.payload));
        break;
      case 'INCREMENT_US_CURRENT_Q_NUM':
        dispatch(incrementQuestionNumber());
        break;
      case 'SET_US_MEDIA_STREAM':
        dispatch(setMediaStream(action.payload));
        break;
      case 'SET_US_CONSUMER_TS':
        dispatch(setConsumerTransport(action.payload));
        break;
      case 'SET_US_CONSUMER_STATE':
        dispatch(setConsumer(action.payload));
        break;
      case 'INCREMENT_US_TRIGGER':
        dispatch(incrementTrigger());
        break;
      // Add other action types as needed
      default:
        console.warn('Unknown action type:', action.type);
    }
  }, [dispatch]);
  
  return dispatchAction;
}

/**
 * Custom hook to manage quiz socket connections
 */
export function useQuizSocket(quizId?: string) {
  const dispatchAction = useLegacyActionMapper();
  const dispatch = useAppDispatch();
  
  // Store quizId in Redux
  useEffect(() => {
    if (quizId) {
      dispatch(setQuizId(quizId));
    }
  }, [quizId, dispatch]);
  
  // Create socket manager
  const quizSocketManager = useMemo(
    () => quizId ? new QuizParticipantManager(dispatchAction) : null,
    [quizId, dispatchAction]
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
 * Custom hook to use and manage media streaming
 */
export function useMediaStream() {
  const dispatch = useAppDispatch();
  const { mediaStream, consumer, consumerTransport } = useAppSelector(state => state.mediaStreamSlice);
  
  // Local state for MediaSoup device
  const [device, setDevice] = useState<Device | null>(null);
  
  // Create media stream manager
  const mediaStreamManager = useMemo(() => new MediaStreamBroadcaster(), []);
  
  // Create wrapper functions for the MediaStreamBroadcaster callbacks
  const setConsumerTransportWrapper = useCallback((transport: Transport<AppData> | null) => {
    dispatch(setConsumerTransport(transport));
  }, [dispatch]);
  
  const setConsumerWrapper = useCallback((consumer: Consumer<AppData> | null) => {
    dispatch(setConsumer(consumer));
  }, [dispatch]);
  
  const setMediaStreamWrapper = useCallback((stream: MediaStream | null) => {
    dispatch(setMediaStream(stream));
  }, [dispatch]);
  
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
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (consumer) {
        consumer.close();
        dispatch(setConsumer(null));
      }
      
      if (consumerTransport) {
        consumerTransport.close();
        dispatch(setConsumerTransport(null));
      }
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        dispatch(setMediaStream(null));
      }
    };
  }, [consumer, consumerTransport, mediaStream, dispatch]);
  
  /**
   * Start the consumption process
   */
  const startConsuming = useCallback(() => {
    dispatch(setIsConnecting(true));
    
    try {
      if (!device) {
        // Get RTP capabilities if no device exists
        mediaStreamManager.createRoom(createDevice);
      } else {
        // Create receive transport if device exists
        createReceiveTransport();
      }
    } catch (err) {
      console.error('Error starting consumption:', err);
      dispatch(setIsConnecting(false));
      dispatch(setConnectionError(err instanceof Error ? err.message : 'Unknown error'));
      Alert.alert('Connection Error', 'Failed to connect to stream');
    }
  }, [device, dispatch, mediaStreamManager]);
  
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
      dispatch(setIsConnecting(false));
      dispatch(setConnectionError(err instanceof Error ? err.message : 'Device creation failed'));
      
      const error = err as Error;
      if (error.name === 'UnsupportedError') {
        Alert.alert('Error', 'Your device doesn\'t support WebRTC');
      } else {
        Alert.alert('Connection Error', 'Failed to set up stream connection');
      }
    }
  }, [dispatch]);
  
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
        setConsumerTransportWrapper as Dispatch<SetStateAction<Transport<AppData> | null>>,
        currentDevice,
        connectReceiveTransport
      );
    } catch (err) {
      console.error('Error creating receive transport:', err);
      dispatch(setIsConnecting(false));
      dispatch(setConnectionError(err instanceof Error ? err.message : 'Transport creation failed'));
      Alert.alert('Connection Error', 'Failed to establish streaming connection');
    }
  }, [device, dispatch, mediaStreamManager, setConsumerTransportWrapper]);
  
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
        setConsumerWrapper as Dispatch<SetStateAction<Consumer<AppData> | null>>,
        setMediaStreamWrapper as Dispatch<SetStateAction<MediaStream | null>>
      );
    } catch (err) {
      console.error('Error connecting receive transport:', err);
      dispatch(setIsConnecting(false));
      dispatch(setConnectionError(err instanceof Error ? err.message : 'Connection failed'));
      Alert.alert('Connection Error', 'Failed to connect to stream');
    }
  }, [dispatch, mediaStreamManager, setConsumerWrapper, setMediaStreamWrapper]);
  
  /**
   * Disconnect from the stream
   */
  const disconnect = useCallback(() => {
    if (consumer) {
      consumer.close();
      dispatch(setConsumer(null));
    }
    
    if (consumerTransport) {
      consumerTransport.close();
      dispatch(setConsumerTransport(null));
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      dispatch(setMediaStream(null));
    }
  }, [consumer, consumerTransport, mediaStream, dispatch]);
  
  return {
    mediaStreamManager,
    startConsuming,
    disconnect,
    isConnected: !!mediaStream
  };
}

/**
 * Custom hook to access quiz and media stream state together
 */
export function useBroadcastState() {
  const quizState = useAppSelector(state => state.quizSlice);
  const mediaStreamState = useAppSelector(state => state.mediaStreamSlice);
  
  // Combined state for components that need both
  return {
    ...quizState,
    ...mediaStreamState
  };
}