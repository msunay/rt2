import type { Answer, ParticipationAnswer, QuestionAnswer } from '@/types/Types';

interface PlayerQuestionState {
  userParticipationAnswer: ParticipationAnswer;
  currentQuestion: QuestionAnswer;
  selectedBtn: number | null;
  currentAnswers: Answer[];
}

export const defaultPlayerQuestionState: PlayerQuestionState = {
  userParticipationAnswer: {} as ParticipationAnswer,
  currentQuestion: {} as QuestionAnswer,
  selectedBtn: null,
  currentAnswers: [],
};

const playerQuestionStateActions = {
  SET_PQ_PART_ANS: 'SET_PQ_PART_ANS',
  SET_PQ_CURR_Q: 'SET_PQ_CURR_Q',
  SET_PQ_SEL_BTN: 'SET_PQ_SEL_BTN',
  SET_PQ_CURR_ANS: 'SET_PQ_CURR_ANS',
};

type PlayerQuestionStateActionKey = keyof typeof playerQuestionStateActions;

interface PlayerQuestionStateAction {
  type: PlayerQuestionStateActionKey;
  payload: ParticipationAnswer | QuestionAnswer | (number | null) | Answer[];
}

export const playerQuestionStateReducer = (
  state: PlayerQuestionState,
  action: PlayerQuestionStateAction,
): PlayerQuestionState => {
  switch (action.type) {
    case 'SET_PQ_PART_ANS':
      return { ...state, userParticipationAnswer: action.payload as ParticipationAnswer };

    case 'SET_PQ_CURR_Q':
      return { ...state, currentQuestion: action.payload as QuestionAnswer }

    case 'SET_PQ_SEL_BTN':
      return { ...state, selectedBtn: action.payload as (number | null) }

    case 'SET_PQ_CURR_ANS':
      return { ...state, currentAnswers: action.payload as Answer[] }

    default:
      return state;
  }
};
