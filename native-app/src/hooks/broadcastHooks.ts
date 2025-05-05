import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks';

// Import actions from both slices
import {
  setQuizStarted,
  setQuestionHidden,
  incrementQuestionNumber,
  incrementTrigger,
  setQuizId
} from '@/src/features/quizSlice';

import {
  setConsumerTransport,
  setConsumer,
  setMediaStream,
  setIsConnecting,
  setConnectionError
} from '@/src/features/mediaStreamSlice';

// Import socket managers
import { QuizParticipantManager } from '@/src/services/quizParticipantManager';
import { MediaStreamBroadcaster } from '@/src/services/mediaStreamBroadcaster';

/**
 * Custom hook to use quiz socket connections
 */
export function useQuizSocket(quizId?: string) {
  const dispatch = useAppDispatch();

  // Create a callback wrapper for dispatch actions to Redux
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
      case 'INCREMENT_US_TRIGGER':
        dispatch(incrementTrigger());
        break;
      // Media stream actions should go through the mediaStreamSlice now
      case 'SET_US_MEDIA_STREAM':
        dispatch(setMediaStream(action.payload));
        break;
      case 'SET_US_CONSUMER_TS':
        dispatch(setConsumerTransport(action.payload));
        break;
      case 'SET_US_CONSUMER_STATE':
        dispatch(setConsumer(action.payload));
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }, [dispatch]);

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