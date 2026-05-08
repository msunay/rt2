import { MediaStream as RNMediaStream, MediaStreamTrack as RNMediaStreamTrack } from 'react-native-webrtc';

/**
 * Type casting helpers to bridge React Native WebRTC types with mediasoup-client expectations
 *
 * mediasoup-client expects browser-native MediaStream/MediaStreamTrack types,
 * but React Native WebRTC provides its own implementations. These are compatible
 * at runtime but TypeScript doesn't know that.
 */

export function toMediasoupTrack(track: RNMediaStreamTrack): any {
  // Cast to any to bypass TypeScript's strict type checking
  // This is safe because React Native WebRTC tracks are compatible with mediasoup
  return track as any;
}

export function toMediasoupStream(stream: RNMediaStream): any {
  return stream as any;
}

// For the reverse direction (from mediasoup to React Native)
export function toRNMediaStream(stream: any): RNMediaStream {
  return stream as RNMediaStream;
}

export function toRNMediaStreamTrack(track: any): RNMediaStreamTrack {
  return track as RNMediaStreamTrack;
}
