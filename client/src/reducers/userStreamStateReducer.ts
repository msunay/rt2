import type { AVPlaybackStatus } from 'expo-av';
import type { types as mediasoupTypes } from 'mediasoup-client';

interface UserStreamState {
  quizStarted: boolean;
  questionHidden: boolean;
  trigger: number;
  consumerTransportState: mediasoupTypes.Transport;
  consumerState: mediasoupTypes.Consumer;
  avStatus: AVPlaybackStatus;
}

export const defaultUserStreamState: UserStreamState = {
  quizStarted: false,
  questionHidden: false,
  trigger: 0,
  consumerTransportState: {} as mediasoupTypes.Transport,
  consumerState: {} as mediasoupTypes.Consumer,
  avStatus: {} as AVPlaybackStatus,
};

const userStreamStateActions = {
  SET_US_QUIZ_STARTED: 'SET_US_QUIZ_STARTED',
  SET_US_Q_HIDDEN: 'SET_US_Q_HIDDED',
  INCREMENT_US_TRIGGER: 'INCREMENT_US_TRIGGER',
  SET_US_CONSUMER_TS: 'SET_US_CONSUMER_TS',
  SET_US_CONSUMER_STATE: 'SET_US_CONSUMER_STATE',
  SET_US_AV_STATUS: 'SET_US_AV_STATUS',
};

type UserStreamStateActionKey = keyof typeof userStreamStateActions;

export interface UserStreamStateAction {
  type: UserStreamStateActionKey;
  payload?:
    | boolean
    | mediasoupTypes.Transport
    | mediasoupTypes.Consumer
    | AVPlaybackStatus
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
      return { ...state, questionHidden: action.payload as boolean }

    case 'INCREMENT_US_TRIGGER':
      return { ...state, trigger: state.trigger++ }

    case 'SET_US_CONSUMER_TS':
      return { ...state, consumerTransportState: action.payload as mediasoupTypes.Transport }

    case 'SET_US_CONSUMER_STATE':
      return { ...state, consumerState: action.payload as mediasoupTypes.Consumer }

    case 'SET_US_AV_STATUS':
      return { ...state, avStatus: action.payload as AVPlaybackStatus}

    default:
      return state;
  }
};
