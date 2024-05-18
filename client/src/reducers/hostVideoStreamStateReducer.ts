import type { MediaStream } from 'react-native-webrtc';

export interface HostVideoStreamState {
  quizStarted: boolean;
  questionHidden: boolean;
  trigger: number;
  mediaStream: MediaStream | undefined;
  actionBtnOpen: boolean;
  frontFacing: boolean;
}

export const defaultHostVideoStreamState: HostVideoStreamState = {
  quizStarted: false,
  questionHidden: false,
  trigger: 0,
  mediaStream: undefined,
  actionBtnOpen: false,
  frontFacing: true,
};

const hostVideoStreamStateActions = {
  SET_HVS_QUIZ_STARTED: 'SET_HVS_QUIZ_STARTED',
  SET_HVS_Q_HIDDEN: 'SET_HVS_Q_HIDDEN',
  INCREMENT_HVS_TRIGGER: 'INCREMENT_HVS_TRIGGER',
  SET_HVS_MEDIA_STREAM: 'SET_HVS_MEDIA_STREAM',
  TOGGLE_HVS_ACTION_BTN_OPEN: 'TOGGLE_HVS_ACTION_BTN_OPEN',
  TOGGLE_HVS_FRONT_FACING: 'TOGGLE_HVS_FRONT_FACING',
};

type HostVideoStreamStateActionKey = keyof typeof hostVideoStreamStateActions;

export interface HostVideoStreamStateAction {
  type: HostVideoStreamStateActionKey;
  payload: boolean | (MediaStream | undefined);
}

export const hostVideoStreamStateReducer = (
  state: HostVideoStreamState,
  action: HostVideoStreamStateAction,
): HostVideoStreamState => {
  switch (action.type) {
    case 'SET_HVS_QUIZ_STARTED':
      return { ...state, quizStarted: action.payload as boolean };

    case 'SET_HVS_Q_HIDDEN':
      return { ...state, questionHidden: action.payload as boolean };

    case 'INCREMENT_HVS_TRIGGER':
      return { ...state, trigger: state.trigger + 1};

    case 'SET_HVS_MEDIA_STREAM':
      return { ...state, mediaStream: action.payload as MediaStream | undefined };

    case 'TOGGLE_HVS_ACTION_BTN_OPEN':
      return { ...state, actionBtnOpen: !state.actionBtnOpen };

    case 'TOGGLE_HVS_FRONT_FACING':
      return { ...state, frontFacing: !state.frontFacing };

    default:
      return state;
  }
};
