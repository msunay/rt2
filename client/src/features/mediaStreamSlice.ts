import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MediaStream } from 'react-native-webrtc';
import type { AVPlaybackStatus } from 'expo-av';
import type { types as mediasoupTypes } from 'mediasoup-client';

/**
 * Interface for media stream state
 * Handles both media streaming objects andconnection state
 */
export interface MediaStreamState {
  consumerTransport: mediasoupTypes.Transport | null;
  consumer: mediasoupTypes.Consumer | null;
  mediaStream: MediaStream | null;
  avStatus: AVPlaybackStatus | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;
}

/**
 * Initial media stream state
 */
const initialState: MediaStreamState = {
  consumerTransport: null,
  consumer: null,
  mediaStream: null,
  avStatus: null,
  isConnecting: false,
  isConnected: false,
  connectionError: null
};

/**
 * Media stream slice for Redux
 * Handles actions related to media streaming and connection status
 */
const mediaStreamSlice = createSlice({
  name: 'mediaStream',
  initialState,
  reducers: {
    // MediaSoup objects
    setConsumerTransport: (state, action: PayloadAction<mediasoupTypes.Transport | null>) => {
      state.consumerTransport = action.payload;
    },
    setConsumer: (state, action: PayloadAction<mediasoupTypes.Consumer | null>) => {
      state.consumer = action.payload;
    },
    setMediaStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.mediaStream = action.payload;
      
      // Update connection state when media stream changes
      state.isConnected = !!action.payload;
      if (action.payload) {
        state.isConnecting = false;
        state.connectionError = null;
      }
    },
    setAVStatus: (state, action: PayloadAction<AVPlaybackStatus | null>) => {
      state.avStatus = action.payload;
    },
    
    // Connection UI state
    setIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
      if (action.payload) {
        // Clear errors when starting to connect
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
      state.isConnecting = false;
    },
    
    // Reset media stream state
    resetMediaStreamState: () => initialState
  }
});

// Export actions
export const {
  setConsumerTransport,
  setConsumer,
  setMediaStream,
  setAVStatus,
  setIsConnecting,
  setConnectionError,
  resetMediaStreamState
} = mediaStreamSlice.actions;

// Export reducer
export default mediaStreamSlice.reducer;