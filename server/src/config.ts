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
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032",
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
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    },
  },
};
