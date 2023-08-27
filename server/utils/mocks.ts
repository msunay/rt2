const mocks = {
  hosts: [
    {
      id: '0cf7cbe4-0c52-4a1a-940a-65d47f769c08',
      email: 'mock@host.com',
      username: 'jimmyHost',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: true,
      pointsWon: 0,
    },
  ],
  players: [
    {
      id: 'efde9495-1ec4-4c7d-b344-b68000c00291',
      email: 'dave@email.com',
      username: 'dave',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
    {
      id: '67136c1f-573e-4f57-a403-91719b98584e',
      email: 'mike@email.com',
      username: 'mike',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
    {
      id: '78b9e627-c22b-495e-973f-5aa0bd95a525',
      email: 'john@email.com',
      username: 'john',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
    {
      id: '87363573-d48f-43e9-81a0-3d64af38380b',
      email: 'kevin@email.com',
      username: 'kevin',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
  ],
  quizIdArray: [
    '98e03864-eec4-4800-941c-4b1dbe78301f',
    'fb5a9d14-f083-4ec3-9d7c-05b920a250fd',
    '7e3ad734-fd07-45d4-acf9-3d12b05bcb19',
    'd0da9fc4-d186-4186-bf32-d0bb2fad1f8f',
    '690c7980-336d-4ee6-ab92-8edb832b174d',
  ],
  streamData: {
    routerRtpCapabilities: {
      "codecs": [
          {
              "kind": "audio",
              "mimeType": "audio/opus",
              "clockRate": 48000,
              "channels": 2,
              "rtcpFeedback": [
                  {
                      "type": "nack",
                      "parameter": ""
                  },
                  {
                      "type": "transport-cc",
                      "parameter": ""
                  }
              ],
              "parameters": {},
              "preferredPayloadType": 100
          },
          {
              "kind": "video",
              "mimeType": "video/H264",
              "clockRate": 90000,
              "parameters": {
                  "level-asymmetry-allowed": 1,
                  "x-google-start-bitrate": 1000,
                  "packetization-mode": 1,
                  "profile-level-id": "640033"
              },
              "rtcpFeedback": [
                  {
                      "type": "nack",
                      "parameter": ""
                  },
                  {
                      "type": "nack",
                      "parameter": "pli"
                  },
                  {
                      "type": "ccm",
                      "parameter": "fir"
                  },
                  {
                      "type": "goog-remb",
                      "parameter": ""
                  },
                  {
                      "type": "transport-cc",
                      "parameter": ""
                  }
              ],
              "preferredPayloadType": 101
          },
          {
              "kind": "video",
              "mimeType": "video/rtx",
              "preferredPayloadType": 102,
              "clockRate": 90000,
              "parameters": {
                  "apt": 101
              },
              "rtcpFeedback": []
          }
      ],
      "headerExtensions": [
          {
              "kind": "audio",
              "uri": "urn:ietf:params:rtp-hdrext:sdes:mid",
              "preferredId": 1,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "urn:ietf:params:rtp-hdrext:sdes:mid",
              "preferredId": 1,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id",
              "preferredId": 2,
              "preferredEncrypt": false,
              "direction": "recvonly"
          },
          {
              "kind": "video",
              "uri": "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id",
              "preferredId": 3,
              "preferredEncrypt": false,
              "direction": "recvonly"
          },
          {
              "kind": "audio",
              "uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
              "preferredId": 4,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
              "preferredId": 4,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "audio",
              "uri": "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
              "preferredId": 5,
              "preferredEncrypt": false,
              "direction": "recvonly"
          },
          {
              "kind": "video",
              "uri": "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
              "preferredId": 5,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07",
              "preferredId": 6,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "urn:ietf:params:rtp-hdrext:framemarking",
              "preferredId": 7,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "audio",
              "uri": "urn:ietf:params:rtp-hdrext:ssrc-audio-level",
              "preferredId": 10,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "urn:3gpp:video-orientation",
              "preferredId": 11,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "urn:ietf:params:rtp-hdrext:toffset",
              "preferredId": 12,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "audio",
              "uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time",
              "preferredId": 13,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          },
          {
              "kind": "video",
              "uri": "http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time",
              "preferredId": 13,
              "preferredEncrypt": false,
              "direction": "sendrecv"
          }
      ]
    },
  }
};

export default mocks;