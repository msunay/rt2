import { MediaStreamBroadcaster } from '@/src/services/mediaStreamBroadcaster';
import type { Device, Transport } from 'mediasoup-client/types';
import { mockDevice, mockTransport, resetMediasoupMocks } from '@/src/mocks/mediasoup-client'; // Adjust path
import { AppData, DtlsParameters, RtpCapabilities, TransportOptions } from 'mediasoup-client/types';

// Mock the base class and socket
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn((event, data, callback) => {
    // Simulate callback for specific events if needed
    if (event === 'create_room' && callback) {
      callback({ rtpCapabilities: { codecs: [], headerExtensions: [] } });
    }
    if (event === 'createWebRtcTransport' && callback) {
      callback({ transportOptions: { id: 'test-transport', iceParameters: {}, iceCandidates: [], dtlsParameters: {} } });
    }
    if (event === 'transport_produce' && callback) {
        callback({ id: 'server-producer-id' });
    }
    // Add other event callbacks as needed
  }),
  disconnect: jest.fn(),
};
jest.mock('@/src/services/webSocketManager', () => {
  return {
    WebSocketManager: jest.fn().mockImplementation(() => ({
      getSocket: () => mockSocket,
      addListener: jest.fn((event, callback) => mockSocket.on(event, callback)),
      removeListener: jest.fn((event) => mockSocket.off(event)),
      log: jest.fn(), // Mock log method
      disconnect: jest.fn(() => mockSocket.disconnect()),
    })),
  };
});

describe('MediaStreamBroadcaster', () => {
  let broadcaster: MediaStreamBroadcaster;
  let mockCreateDeviceCb: jest.Mock;
  let mockSetProducerTransportCb: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks from previous tests
    resetMediasoupMocks(); // Reset stateful mocks
    broadcaster = new MediaStreamBroadcaster();
    mockCreateDeviceCb = jest.fn().mockResolvedValue(undefined);
    mockSetProducerTransportCb = jest.fn();
  });

  it('should initialize with the correct namespace', () => {
    expect(MediaStreamBroadcaster).toHaveBeenCalledTimes(1);
    // If WebSocketManager constructor was more complex, add assertions here
  });

  describe('Listeners', () => {
    it('setupConnectionListener should add listener for connection_success', () => {
      broadcaster.setupConnectionListener();
      expect((broadcaster as any).addListener).toHaveBeenCalledWith(
        'connection_success',
        expect.any(Function),
        'Streaming host connection'
      );
    });

    it('removeConnectionListener should remove listener for connection_success', () => {
      broadcaster.removeConnectionListener();
      expect((broadcaster as any).removeListener).toHaveBeenCalledWith(
        'connection_success',
        null,
        'Streaming host connection'
      );
    });

     // Add tests for setup/remove ProducerClosedListener similarly
  });

  describe('createRoom', () => {
    it('should emit create_room and call createDevice callback', async () => {
      broadcaster.createRoom(mockCreateDeviceCb);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'create_room',
        expect.any(Function) // The callback passed to emit
      );

      // Simulate server response by invoking the emit callback
      const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'create_room')[1];
      const mockRtpCaps = { codecs: [{ kind: 'audio', mimeType: 'audio/opus' }], headerExtensions: [] };
      await emitCallback({ rtpCapabilities: mockRtpCaps });

      expect(mockCreateDeviceCb).toHaveBeenCalledWith(mockRtpCaps);
      expect((broadcaster as any).log).toHaveBeenCalledWith('Router RTP Capabilities received');
      expect((broadcaster as any).log).toHaveBeenCalledWith('Device created with RTP capabilities');
    });

     it('should log error if createDevice callback fails', async () => {
       const error = new Error('Device creation failed');
       mockCreateDeviceCb.mockRejectedValue(error);
       broadcaster.createRoom(mockCreateDeviceCb);

       const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'create_room')[1];
       await emitCallback({ rtpCapabilities: {} }); // Simulate response

       // Need await tick or similar if createDeviceCb is truly async and might not finish immediately
       await Promise.resolve(); // Allow promise rejection to settle

       expect(mockCreateDeviceCb).toHaveBeenCalled();
       expect((broadcaster as any).log).toHaveBeenCalledWith(`Error creating device: ${error}`, 'error');
     });
  });

  describe('createProducerTransport', () => {
     const mockRtpCaps = { codecs: [], headerExtensions: [] };
     const mockTransportOptions = { id: 't1', iceParameters: {}, iceCandidates: [], dtlsParameters: {} } as unknown as TransportOptions ;

     beforeEach(() => {
        // Simulate device already created
        mockDevice.load({ routerRtpCapabilities: mockRtpCaps });
     });

    it('should emit createWebRtcTransport and setup transport', () => {
      broadcaster.createProducerTransport(mockSetProducerTransportCb, mockDevice as unknown as Device);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'createWebRtcTransport',
        { producer: true },
        expect.any(Function)
      );

      // Simulate server response
      const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'createWebRtcTransport')[1];
      emitCallback({ transportOptions: mockTransportOptions });

      expect(mockDevice.createSendTransport).toHaveBeenCalledWith(mockTransportOptions);
      expect(mockSetProducerTransportCb).toHaveBeenCalledWith(mockTransport); // Check if the mock transport was passed back
      expect((broadcaster as any).log).toHaveBeenCalledWith('Producer transport options received');
      expect((broadcaster as any).log).toHaveBeenCalledWith(`Created send transport: ${mockTransport.id}`);
      expect(mockTransport.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockTransport.on).toHaveBeenCalledWith('produce', expect.any(Function));
    });

     it('should handle transport connect event', () => {
       broadcaster.createProducerTransport(mockSetProducerTransportCb, mockDevice as unknown as Device);
       const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'createWebRtcTransport')[1];
       emitCallback({ transportOptions: mockTransportOptions }); // Create transport

       // Find and trigger the 'connect' listener
       const connectListener = (mockTransport as any).on.mock.calls.find((call: any) => call[0] === 'connect')[1];
       const mockDtls: DtlsParameters = { fingerprints: [], role: 'auto' };
       const mockOnSuccess = jest.fn();
       const mockOnError = jest.fn();
       connectListener({ dtlsParameters: mockDtls }, mockOnSuccess, mockOnError);

       expect(mockSocket.emit).toHaveBeenCalledWith('transport_connect', { dtlsParameters: mockDtls });
       expect(mockOnSuccess).toHaveBeenCalled();
       expect(mockOnError).not.toHaveBeenCalled();
     });

     it('should handle transport produce event', () => {
        broadcaster.createProducerTransport(mockSetProducerTransportCb, mockDevice as unknown as Device);
        const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'createWebRtcTransport')[1];
        emitCallback({ transportOptions: mockTransportOptions }); // Create transport

        // Find and trigger the 'produce' listener
        const produceListener = (mockTransport as any).on.mock.calls.find((call: any) => call[0] === 'produce')[1];
        const mockParams = { kind: 'video', rtpParameters: {}, appData: { foo: 'bar' } };
        const mockOnSuccess = jest.fn();
        const mockOnError = jest.fn();
        produceListener(mockParams, mockOnSuccess, mockOnError);

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'transport_produce',
            mockParams,
            expect.any(Function) // Server callback
        );

        // Simulate server callback for produce
        const produceEmitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'transport_produce')[2];
        produceEmitCallback({ id: 'server-prod-id' });

        expect(mockOnSuccess).toHaveBeenCalledWith({ id: 'server-prod-id' });
        expect(mockOnError).not.toHaveBeenCalled();
     });

     it('should handle errors during transport creation', () => {
        const error = new Error('Send transport creation failed');
        mockDevice.createSendTransport.mockImplementation(() => { throw error; });

        broadcaster.createProducerTransport(mockSetProducerTransportCb, mockDevice as unknown as Device);
        const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'createWebRtcTransport')[1];

        expect(() => emitCallback({ transportOptions: mockTransportOptions })).toThrow(error);
        expect(mockSetProducerTransportCb).not.toHaveBeenCalled();
        expect((broadcaster as any).log).toHaveBeenCalledWith(`Error creating send transport: ${error.message}`, 'error');
     });

     it('should handle null transportOptions', () => {
        broadcaster.createProducerTransport(mockSetProducerTransportCb, mockDevice as unknown as Device);
        const emitCallback = (mockSocket as any).emit.mock.calls.find((call: any) => call[0] === 'createWebRtcTransport')[1];

        expect(() => emitCallback({ transportOptions: null })).toThrow('Transport options are null');
        expect(mockDevice.createSendTransport).not.toHaveBeenCalled();
        expect((broadcaster as any).log).toHaveBeenCalledWith('Transport options are null', 'error');
     });
  });

  // Add similar tests for createConsumerTransport, consume, and Redux methods if needed
});
