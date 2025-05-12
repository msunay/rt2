import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AVPlaybackStatus } from 'expo-av';
import type { types as mediasoupTypes } from 'mediasoup-client';

export interface MediaStreamState {
  // --- Producer (Broadcaster) Specific State ---
  producerHasLocalMedia: boolean; // True if local media (camera/mic) is acquired
  producerIsConnecting: boolean; // True when producer is attempting to connect/stream
  producerIsStreaming: boolean; // True when producer is actively streaming to Mediasoup
  producerConnectionError: string | null;

  // --- Consumer (Receiver) Specific State ---
  // consumerTransport: mediasoupTypes.Transport | null; // Mediasoup transport for receiving
  consumerID: string | null; // Mediasoup consumer object
  consumerIsConnecting: boolean; // True when consumer is attempting to connect/receive
  consumerIsReceivingStream: boolean; // True when consumer is actively receiving a remote stream
  consumerConnectionError: string | null;
  consumerAVStatus: AVPlaybackStatus | null; // Playback status for the consumed stream

  // --- Potentially Shared/Generic State (can be further split if needed) ---
  // For now, connectionError is split. isConnecting is split.
}

const initialState: MediaStreamState = {
  // Producer
  producerHasLocalMedia: false,
  producerIsConnecting: false,
  producerIsStreaming: false,
  producerConnectionError: null,

  // Consumer
  // consumerTransport: null,
  consumerID: null,
  consumerIsConnecting: false,
  consumerIsReceivingStream: false,
  consumerConnectionError: null,
  consumerAVStatus: null,
};

const mediaStreamSlice = createSlice({
  name: 'mediaStreamSlice',
  initialState,
  reducers: {
    // --- Producer Actions ---
    setProducerHasLocalMedia: (state, action: PayloadAction<boolean>) => {
      state.producerHasLocalMedia = action.payload;
      if (!action.payload) {
        state.producerIsStreaming = false;
      }
    },
    setProducerIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.producerIsConnecting = action.payload;
      if (action.payload) {
        state.producerConnectionError = null;
        state.producerIsStreaming = false;
      }
    },
    setProducerStreamingStatus: (
      state,
      action: PayloadAction<{ isActive: boolean }>,
    ) => {
      state.producerIsStreaming = action.payload.isActive;
      if (action.payload.isActive) {
        state.producerIsConnecting = false;
        state.producerConnectionError = null;
      } else {
        // state.producerIsConnecting = false; // Or handled by a specific reconnect logic
      }
    },
    setProducerConnectionError: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.producerConnectionError = action.payload;
      state.producerIsConnecting = false;
      state.producerIsStreaming = false;
    },

    // --- Consumer Actions ---
    setConsumerID: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.consumerID = action.payload;
    },
    setConsumerIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.consumerIsConnecting = action.payload;
      if (action.payload) {
        state.consumerConnectionError = null;
        state.consumerIsReceivingStream = false;
      }
    },
    setConsumerStreamActive: (
      state,
      action: PayloadAction<{ isActive: boolean }>,
    ) => {
      state.consumerIsReceivingStream = action.payload.isActive;
      if (action.payload.isActive) {
        state.consumerIsConnecting = false;
        state.consumerConnectionError = null;
      } else {
        // state.consumerIsConnecting = false;
      }
    },
    setConsumerConnectionError: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.consumerConnectionError = action.payload;
      state.consumerIsConnecting = false;
      state.consumerIsReceivingStream = false;
    },
    setConsumerAVStatus: (
      state,
      action: PayloadAction<AVPlaybackStatus | null>,
    ) => {
      state.consumerAVStatus = action.payload;
    },

    // --- General Actions ---
    resetMediaStreamState: () => initialState,
  },
});

// const mediaStreamSlice = createSlice({
//   name: 'mediaStreamSlice', // Changed name to avoid conflict if 'mediaStream' is used elsewhere
//   initialState,
//   reducers: {
//     setConsumerTransport: (
//       state,
//       action: PayloadAction<mediasoupTypes.Transport | null>,
//     ) => {
//       state.consumerTransport = action.payload;
//     },
//     setConsumer: (
//       state,
//       action: PayloadAction<mediasoupTypes.Consumer | null>,
//     ) => {
//       state.consumer = action.payload;
//     },
//     // setMediaStream: (state, action: PayloadAction<MediaStream | null>) => { ... }, // REMOVED
//     setAVStatus: (state, action: PayloadAction<AVPlaybackStatus | null>) => {
//       state.avStatus = action.payload;
//     },
//     setIsConnecting: (state, action: PayloadAction<boolean>) => {
//       state.isConnecting = action.payload;
//       if (action.payload) {
//         state.connectionError = null;
//         state.isConnected = false;
//       }
//     },
//     setConnectionError: (state, action: PayloadAction<string | null>) => {
//       state.connectionError = action.payload;
//       state.isConnecting = false;
//       state.isConnected = false;
//     },
//     setHasLocalMedia: (state, action: PayloadAction<boolean>) => {
//       state.hasLocalMedia = action.payload;
//       if (!action.payload) {
//         state.isConnected = false;
//       }
//     },
//     setStreamingStatus: (
//       state,
//       action: PayloadAction<{ isActive: boolean }>,
//     ) => {
//       state.isConnected = action.payload.isActive;
//       if (action.payload.isActive) {
//         state.isConnecting = false;
//         state.connectionError = null;
//       } else {
//         state.isConnecting = false;
//       }
//     },
//     resetMediaStreamState: () => initialState,
//   },
// });

export const {
  // Producer
  setProducerHasLocalMedia,
  setProducerIsConnecting,
  setProducerStreamingStatus,
  setProducerConnectionError,
  // Consumer
  // setConsumerTransport,
  setConsumerID,
  setConsumerIsConnecting,
  setConsumerStreamActive,
  setConsumerConnectionError,
  setConsumerAVStatus,
  // General
  resetMediaStreamState,
} = mediaStreamSlice.actions;

export default mediaStreamSlice.reducer;