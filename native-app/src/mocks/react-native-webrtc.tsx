export const mockMediaStream = {
    toURL: jest.fn(() => 'mock-stream-url'),
    getTracks: jest.fn(() => [mockMediaStreamTrack]),
    getVideoTracks: jest.fn(() => [mockMediaStreamTrack]),
    getAudioTracks: jest.fn(() => []),
    addTrack: jest.fn(),
    removeTrack: jest.fn(),
    release: jest.fn(),
  };

  export const mockMediaStreamTrack = {
    kind: 'video',
    id: 'mock-track-id',
    label: 'mock-track-label',
    enabled: true,
    muted: false,
    readyState: 'live',
    stop: jest.fn(),
    release: jest.fn(),
    applyConstraints: jest.fn(),
    clone: jest.fn(),
    getCapabilities: jest.fn(),
    getConstraints: jest.fn(),
    getSettings: jest.fn(),
    onended: null,
    onmute: null,
    onunmute: null,
  };

  export const mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue(mockMediaStream),
    // Add other mediaDevices methods if used
  };

  export const RTCView = jest.fn(({ streamURL, ...props }) => (
    // Simple mock component for testing props
    <div data-testid="mock-rtc-view" data-stream-url={streamURL} {...props} />
  ));

  export const registerGlobals = jest.fn();
