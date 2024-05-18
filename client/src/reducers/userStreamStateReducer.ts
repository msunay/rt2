import type { AVPlaybackStatus } from 'expo-av';
import type { types as mediasoupTypes } from 'mediasoup-client';
import type { MediaStream } from 'react-native-webrtc';

interface UserStreamState {
  quizStarted: boolean;
  questionHidden: boolean;
  currentQuestionNumber: number;
  consumerTransportState: mediasoupTypes.Transport;
  consumerState: mediasoupTypes.Consumer;
  avStatus: AVPlaybackStatus;
  mediaStream: MediaStream | undefined;
}

export const defaultUserStreamState: UserStreamState = {
  quizStarted: false,
  questionHidden: false,
  currentQuestionNumber: 1,
  consumerTransportState: {} as mediasoupTypes.Transport,
  consumerState: {} as mediasoupTypes.Consumer,
  avStatus: {} as AVPlaybackStatus,
  mediaStream: undefined,
};

const userStreamStateActions = {
  SET_US_QUIZ_STARTED: 'SET_US_QUIZ_STARTED',
  SET_US_Q_HIDDEN: 'SET_US_Q_HIDDED',
  INCREMENT_US_CURRENT_Q_NUM: 'INCREMENT_US_CURRENT_Q_NUM',
  SET_US_CONSUMER_TS: 'SET_US_CONSUMER_TS',
  SET_US_CONSUMER_STATE: 'SET_US_CONSUMER_STATE',
  SET_US_AV_STATUS: 'SET_US_AV_STATUS',
  SET_US_MEDIA_STREAM: 'SET_US_MEDIA_STREAM',
};

type UserStreamStateActionKey = keyof typeof userStreamStateActions;

export interface UserStreamStateAction {
  type: UserStreamStateActionKey;
  payload?:
    | boolean
    | mediasoupTypes.Transport
    | mediasoupTypes.Consumer
    | AVPlaybackStatus
    | MediaStream
    | undefined;
}

export const userStreamStateReducer = (
  state: UserStreamState,
  action: UserStreamStateAction,
): UserStreamState => {
  switch (action.type) {
    case 'SET_US_QUIZ_STARTED':
      return { ...state, quizStarted: action.payload as boolean };

    case 'SET_US_Q_HIDDEN':
      return { ...state, questionHidden: action.payload as boolean };

    case 'INCREMENT_US_CURRENT_Q_NUM':
      return { ...state, currentQuestionNumber: state.currentQuestionNumber + 1};

    case 'SET_US_CONSUMER_TS':
      return {
        ...state,
        consumerTransportState: action.payload as mediasoupTypes.Transport,
      };

    case 'SET_US_CONSUMER_STATE':
      return { ...state, consumerState: action.payload as mediasoupTypes.Consumer };

    case 'SET_US_AV_STATUS':
      return { ...state, avStatus: action.payload as AVPlaybackStatus };

    case 'SET_US_MEDIA_STREAM':
      return { ...state, mediaStream: action.payload as MediaStream };

    default:
      return state;
  }
};
