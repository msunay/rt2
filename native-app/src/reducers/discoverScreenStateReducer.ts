import type { Quiz } from '@/src/types/Types';

interface DiscoverScreenState {
  searchQuery: string;
  searchParams: Array<keyof Quiz>;
  publicBtnColor: { [key: string]: string | number }[];
  privateBtnColor: { [key: string]: string | number }[];
  privateToggle: boolean;
}

export const defaultDiscoverScreenState: DiscoverScreenState = {
  searchQuery: '',
  searchParams: ['quizName', 'category'],
  publicBtnColor: [],
  privateBtnColor: [],
  privateToggle: false,
};

const discoverScreenStateActions = {
  SET_DS_SEARCH_QUERY: 'SET_DS_SEARCH_QUERY',
  SET_DS_SEARCH_PARAMS: 'SET_DS_SEARCH_PARAMS',
  SET_DS_PUBLIC_BTN_COLOR: 'SET_DS_PUBLIC_BTN_COLOR',
  SET_DS_PRIVATE_BTN_COLOR: 'SET_DS_PRIVATE_BTN_COLOR',
  SET_DS_PRIVATE_TOGGLE: 'SET_DS_PRIVATE_TOGGLE',
};

type DiscoverScreenStateActionKey = keyof typeof discoverScreenStateActions;

interface DiscoverScreenStateAction {
  type: DiscoverScreenStateActionKey;
  payload: string | Array<keyof Quiz> | { [key: string]: string | number }[] | boolean;
}

export const discoverScreenStateReducer = (
  state: DiscoverScreenState,
  action: DiscoverScreenStateAction,
): DiscoverScreenState => {
  switch (action.type) {
    case 'SET_DS_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload as string };

    case 'SET_DS_SEARCH_PARAMS':
      return { ...state, searchParams: action.payload as Array<keyof Quiz> };

    case 'SET_DS_PUBLIC_BTN_COLOR':
      return {
        ...state,
        publicBtnColor: action.payload as { [key: string]: string | number }[],
      };

    case 'SET_DS_PRIVATE_BTN_COLOR':
      return {
        ...state,
        privateBtnColor: action.payload as { [key: string]: string | number }[],
      };

    case 'SET_DS_PRIVATE_TOGGLE':
      return { ...state, privateToggle: action.payload as boolean };

    default:
      return state;
  }
};
