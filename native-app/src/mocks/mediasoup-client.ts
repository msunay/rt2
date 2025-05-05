import { mockMediaStreamTrack } from "./react-native-webrtc";

const createMockEventEmitter = () => {
    const listeners: Record<string, jest.Mock> = {};
    return {
      on: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
      _emit: (event: string, ...args: any[]) => {
        if (listeners[event]) {
          listeners[event](...args);
        }
      },
      _clearListeners: () => {
        Object.keys(listeners).forEach((key) => delete listeners[key]);
      },
      // Add other emitter methods if needed (off, once, etc.)
    };
  };

  export const mockProducer = {
    id: 'mock-producer-id',
    kind: 'video',
    closed: false,
    track: mockMediaStreamTrack,
    rtpParameters: {},
    appData: {},
    paused: false,
    score: [],
    ...createMockEventEmitter(),
    close: jest.fn(() => {
      mockProducer.closed = true;
      mockProducer._emit('transportclose'); // Simulate event on close
    }),
    pause: jest.fn(),
    resume: jest.fn(),
    replaceTrack: jest.fn(),
    setRtpEncodingParameters: jest.fn(),
    getStats: jest.fn().mockResolvedValue(new Map()),
  };

  export const mockConsumer = {
    id: 'mock-consumer-id',
    producerId: 'mock-producer-id',
    kind: 'video',
    closed: false,
    track: mockMediaStreamTrack,
    rtpParameters: {},
    appData: {},
    paused: false,
    score: [],
    ...createMockEventEmitter(),
    close: jest.fn(() => {
      mockConsumer.closed = true;
      mockConsumer._emit('transportclose'); // Simulate event on close
    }),
    pause: jest.fn(),
    resume: jest.fn(),
    getStats: jest.fn().mockResolvedValue(new Map()),
  };


  export const mockTransport = {
    id: 'mock-transport-id',
    closed: false,
    direction: 'send', // or 'recv'
    connectionState: 'new',
    appData: {},
    ...createMockEventEmitter(),
    close: jest.fn(() => {
      mockTransport.closed = true;
    }),
    produce: jest.fn().mockResolvedValue(mockProducer),
    consume: jest.fn().mockResolvedValue(mockConsumer),
    restartIce: jest.fn().mockResolvedValue(undefined),
    updateIceServers: jest.fn(),
    getStats: jest.fn().mockResolvedValue(new Map()),
  };

  export const mockDevice = {
    loaded: false,
    rtpCapabilities: { codecs: [], headerExtensions: [] }, // Mock RTP capabilities
    sctpCapabilities: {},
    load: jest.fn().mockImplementation(async ({ routerRtpCapabilities }) => {
      mockDevice.rtpCapabilities = routerRtpCapabilities;
      mockDevice.loaded = true;
    }),
    canProduce: jest.fn().mockReturnValue(true),
    createSendTransport: jest.fn().mockReturnValue(mockTransport),
    createRecvTransport: jest.fn().mockReturnValue({ ...mockTransport, direction: 'recv' }),
  };

  export const Device = jest.fn(() => mockDevice);

  // Reset mocks before each test if needed
  export const resetMediasoupMocks = () => {
    jest.clearAllMocks(); // Clear Jest mocks

    // Reset stateful parts of mocks
    mockDevice.loaded = false;
    mockDevice.rtpCapabilities = { codecs: [], headerExtensions: [] };

    mockTransport.closed = false;
    mockTransport.connectionState = 'new';
    mockTransport._clearListeners();

    mockProducer.closed = false;
    mockProducer._clearListeners();

    mockConsumer.closed = false;
    mockConsumer._clearListeners();
  };

