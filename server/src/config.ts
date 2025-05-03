import type { RtpCodecCapability, WorkerLogTag } from "mediasoup/types";

export const config = {
    mediasoup: {
      worker: {
        rtcMinPort: 40000,
        rtcMaxPort: 49999,
        logLevel: "debug" as const,
        logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp", "message"] as WorkerLogTag[],
      },
      webRtcServer: {
        udpBindIp: process.env.UDP_BIND_IP || "0.0.0.0",
        udpAnnouncedAddress: process.env.UDP_ANNOUNCED_ADDRESS || "127.0.0.1",
        tcpBindIp: process.env.TCP_BIND_IP || "0.0.0.0",
        tcpAnnouncedAddress: process.env.TCP_ANNOUNCED_ADDRESS || "127.0.0.1",
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
          ] as RtpCodecCapability[],
      },
    },
    iceServers: [
        {
          urls: "turn:a.relay.metered.ca:80",
          username: process.env.ICE_USERNAME,
          credential: process.env.ICE_CREDENTIAL,
        },
        {
          urls: "turn:a.relay.metered.ca:80?transport=tcp",
          username: process.env.ICE_USERNAME,
          credential: process.env.ICE_CREDENTIAL,
        },
        {
          urls: "turn:a.relay.metered.ca:443",
          username: process.env.ICE_USERNAME,
          credential: process.env.ICE_CREDENTIAL,
        },
        {
          urls: "turn:a.relay.metered.ca:443?transport=tcp",
          username: process.env.ICE_USERNAME,
          credential: process.env.ICE_CREDENTIAL,
        },
      ],
  };