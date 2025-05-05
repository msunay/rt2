import {
  AppData,
  /* Device, */ Producer,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/types";
import { Device } from "mediasoup-client";
import type { MediaStreamBroadcaster } from "../services/mediaStreamBroadcaster";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { useCallback, useEffect, useRef } from "react";
import { mediaDevices, MediaStream } from "react-native-webrtc";
import { Alert } from "react-native";
import {
  setConnectionError,
  setIsConnecting,
  setMediaStream,
} from "../features/mediaStreamSlice";
import { router } from "expo-router";

// Media stream configuration
const MEDIA_CONSTRAINTS: {
  audio: boolean;
  video: {
    facingMode: string;
    width: {
      min: number;
      max: number;
    };
    height: {
      min: number;
      max: number;
    };
  };
} = {
  audio: true,
  video: {
    facingMode: "user",
    width: {
      min: 640,
      max: 1920,
    },
    height: {
      min: 400,
      max: 1080,
    },
  },
};

// Default encoding parameters for video streaming
const DEFAULT_ENCODING_PARAMS: AppData = {
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

/**
 * Hook for mediasoup WebRTC functionality
 */
export const useMediasoupProducer = (streamSocketManager: MediaStreamBroadcaster) => {
  const dispatch = useAppDispatch();
  const mediaStream = useAppSelector(
    (state) => state.mediaStreamSlice.mediaStream
  );

  // Device and transport refs to persist across renders
  const deviceRef = useRef<Device>(null);
  const producerTransportRef = useRef<Transport>(null);
  const producerRef = useRef<Producer>(null);
  const paramsRef = useRef<AppData>(DEFAULT_ENCODING_PARAMS);

  /**
   * Gets local user media stream
   */
  const getLocalStream = useCallback(async () => {
    try {
      if (!mediaStream) {
        const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
        streamSuccess(stream);
      }
    } catch (err) {
      console.error("Failed to get media stream:", err);
      Alert.alert("Camera Error", "Unable to access camera and microphone.");
    }
  }, [mediaStream, dispatch]);

  /**
   * Handles successful stream acquisition
   */
  const streamSuccess = useCallback(
    (stream: MediaStream) => {
      dispatch(setMediaStream(stream));

      const videoTrack = stream.getVideoTracks()[0];
      paramsRef.current = {
        track: videoTrack,
        ...paramsRef.current,
      };
    },
    [dispatch]
  );

  /**
   * Start connection process
   */
  const connect = useCallback(() => {
    dispatch(setIsConnecting(true));
    if (!mediaStream) {
      console.error("No media stream available");
      dispatch(setIsConnecting(false));
      dispatch(setConnectionError("No media stream available"));
      return;
    }
    if (!deviceRef.current) {
      getRtpCapabilities();
    } else {
      createSendTransport();
    }
  }, [dispatch]);

  /**
   * Create mediasoup device with router capabilities
   */
  const createDevice = useCallback(
    async (rtpCapabilities: RtpCapabilities) => {
      try {
        const device = new Device();
        await device.load({
          routerRtpCapabilities: rtpCapabilities,
        });

        console.log("Device RTP Capabilities", device.rtpCapabilities);
        deviceRef.current = device;
        // createSendTransport();
      } catch (err) {
        console.error("Failed to create device:", err);
        dispatch(setIsConnecting(false));
        dispatch(
          setConnectionError(
            err instanceof Error ? err.message : "Unknown error"
          )
        );

        const error = err as Error;
        if (error.name === "UnsupportedError") {
          Alert.alert("Error", "Browser not supported for WebRTC.");
        }
      }
    },
    [dispatch]
  );

  /**
   * Get RTP capabilities from server
   */
  const getRtpCapabilities = useCallback(() => {
    streamSocketManager.createRoom(createDevice);
  }, [streamSocketManager, createDevice]);

  /**
   * Create transport for sending media
   */
  const createSendTransport = useCallback(() => {
    if (!deviceRef.current) {
      console.error("Device not initialized");
      dispatch(setIsConnecting(false));
      dispatch(setConnectionError("Device not initialized"));
      return;
    }

    try {
      streamSocketManager.createProducerTransport(
        (transport) => {
          producerTransportRef.current = transport;
        //   return connectSendTransport(transport);
        },
        deviceRef.current
        // connectSendTransport
      );
    } catch (err) {
      console.error("Failed to create send transport:", err);
      dispatch(setIsConnecting(false));
      dispatch(
        setConnectionError(
          err instanceof Error ? err.message : "Transport creation failed"
        )
      );
    }
  }, [dispatch, streamSocketManager]);

  /**
   * End streaming and clean up resources
   */
  const endStream = useCallback(
    ({ redirect = true }: { redirect?: boolean }) => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        dispatch(setMediaStream(null));
      }

      if (producerRef.current) {
        producerRef.current.close();
        producerRef.current = null;
      }

      if (producerTransportRef.current) {
        producerTransportRef.current.close();
        producerTransportRef.current = null;
      }

      if (redirect) router.navigate("/");
    },
    [dispatch, mediaStream]
  );

  /**
   * Connect the send transport
   */
  const connectSendTransport = useCallback(
    async (producerTransport: Transport) => {
      try {
        if (!paramsRef.current.track) {
          console.error("No track available to produce");
          throw new Error("No track available");
        }

        const producer = await producerTransport.produce(paramsRef.current);
        producerRef.current = producer;

        producer.on("trackended", () => {
          console.log("Track ended");
          endStream({ redirect: false });
        });

        producer.on("transportclose", () => {
          console.log("Transport ended");
          endStream({ redirect: false });
        });

        // Connection successful
        dispatch(setIsConnecting(false));
      } catch (err) {
        console.error("Failed to connect send transport:", err);
        dispatch(setIsConnecting(false));
        dispatch(
          setConnectionError(
            err instanceof Error ? err.message : "Connection failed"
          )
        );
        Alert.alert(
          "Connection Error",
          "Failed to establish streaming connection."
        );

        endStream({ redirect: false });
      }
    },
    [dispatch, mediaStream, endStream]
  );

  // Effect to connect transport once it's created
  useEffect(() => {
    // Only run if transport exists, is not closed, and producer doesn't exist yet
    if (
      producerTransportRef.current &&
      !producerTransportRef.current.closed &&
      !producerRef.current
    ) {
      console.log(
        "Producer transport ref set, attempting to connect/produce..."
      );
      connectSendTransport(producerTransportRef.current);
    }
  }, [producerTransportRef.current]);

  // Cleanup on unmount
  useEffect(() => {
    return () => endStream({});
  }, [endStream]);

  return {
    getLocalStream,
    connect,
    endStream,
  };
};
