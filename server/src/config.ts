import type { RtpCodecCapability, WorkerLogTag } from "mediasoup/types";
import type { MediaSoupServiceConfig } from "./services/mediasoupService";

interface Config {
  mediasoup: MediaSoupServiceConfig;
  [key: string]: any;
}

export const config: Config = {
  mediasoup: {
    worker: {
      rtcMinPort: 49152,
      rtcMaxPort: 50000,
      logLevel: "debug",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp", "message"] as WorkerLogTag[],
    },
    webRtcServerOptions: {
      listenInfos: [
        {
          protocol: "udp",
          ip: process.env.SERVER_BIND_IP || "0.0.0.0",
          announcedAddress: process.env.SERVER_PUBLIC_IP || "127.0.0.1",
        },
        {
          protocol: "tcp",
          ip: process.env.SERVER_BIND_IP || "0.0.0.0",
          announcedAddress: process.env.SERVER_PUBLIC_IP || "127.0.0.1",
        },
      ],
    },
    router: {
      mediaCodecs: [
        // 1. Audio Codec (Opus is always preferred)
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        // 2. Video Codecs - Prioritize modern, efficient codecs for quality
        // VP9 is generally more efficient than VP8, offering better quality at lower bitrates.
        // Use profile-id 2 for maximum compatibility and features (e.g., SVC).
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2, // Prefer VP9 Profile 2 for better quality/features
            "x-google-start-bitrate": 1000, // Hint for initial bitrate (kbps)
          },
        },
        // H.264 is ubiquitous, but ensure you select the best profile-level-id for quality.
        // 42e01f (Constrained Baseline Profile, Level 3.1) is the most compatible, but not highest quality.
        // 4d0032 (High Profile, Level 5.0) is higher quality but might have less broad support on very old devices/browsers.
        // For local dev with modern iPhone, it should be fine. Put the "better" H264 profile first.
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032", // High Profile, Level 5.0 - generally better quality
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f", // Constrained Baseline Profile, Level 3.1 - good fallback
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
        // VP8 as a general fallback. It's widely supported but less efficient than VP9/H.264 for quality.
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    },
  },
};
