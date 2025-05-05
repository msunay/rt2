import * as mediaStreamSlice from '@/src/features/mediaStreamSlice'; // Import slice actions
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks'; // Adjust path
import { useMediasoup } from '@/src/hooks/useMediasoupProducer'; // Adjust path
import { mockDevice, mockProducer, mockTransport, resetMediasoupMocks } from '@/src/mocks/mediasoup-client'; // Adjust path
import { mediaDevices, mockMediaStream, mockMediaStreamTrack } from '@/src/mocks/react-native-webrtc'; // Use mocked versions
import { MediaStreamBroadcaster } from '@/src/services/mediaStreamBroadcaster'; // Adjust path
import { act, renderHook } from '@testing-library/react-native'; // Use renderHook from here
import { router } from 'expo-router'; // Use mocked version
import { Alert } from 'react-native';

// Mock Redux hooks
jest.mock('@/src/hooks/reduxHooks');
const mockDispatch = jest.fn();
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;

// Mock Service
jest.mock('@/src/services/mediaStreamBroadcaster');
const MockMediaStreamBroadcaster = MediaStreamBroadcaster as jest.MockedClass<typeof MediaStreamBroadcaster>;
let mockStreamSocketManagerInstance: jest.Mocked<MediaStreamBroadcaster>;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock slice actions
const mockSetIsConnecting = jest.fn((payload) => ({ type: 'setIsConnecting', payload }));
const mockSetConnectionError = jest.fn((payload) => ({ type: 'setConnectionError', payload }));
const mockSetMediaStream = jest.fn((payload) => ({ type: 'setMediaStream', payload }));
jest.spyOn(mediaStreamSlice, 'setIsConnecting').mockImplementation(mockSetIsConnecting as any);
jest.spyOn(mediaStreamSlice, 'setConnectionError').mockImplementation(mockSetConnectionError as any);
jest.spyOn(mediaStreamSlice, 'setMediaStream').mockImplementation(mockSetMediaStream as any);

describe('useMediasoup Hook', () => {
    const initialMediaStreamState = {
        mediaStream: null,
        isConnecting: false,
        connectionError: null,
        // Add other slice state if needed
    };

    beforeEach(() => {
        jest.clearAllMocks();
        resetMediasoupMocks();
        mockUseAppDispatch.mockReturnValue(mockDispatch);
        mockUseAppSelector.mockImplementation((selector) =>
            selector({
                mediaStreamSlice: initialMediaStreamState,
                // Add other slices if needed
            })
        );

        // Create a fresh mock instance for each test
        MockMediaStreamBroadcaster.mockClear();
        mockStreamSocketManagerInstance = new MockMediaStreamBroadcaster() as jest.Mocked<MediaStreamBroadcaster>;
    });

    const renderUseMediasoup = () => {
        return renderHook(() => useMediasoup(mockStreamSocketManagerInstance));
    };

    it('should initialize refs to null', () => {
        const { result } = renderUseMediasoup();
        // Accessing refs directly is tricky in tests, focus on behavior
        // We can infer initial state by checking calls in connect/endStream
        expect(result.current.getLocalStream).toBeDefined();
        expect(result.current.connect).toBeDefined();
        expect(result.current.endStream).toBeDefined();
    });

    describe('getLocalStream', () => {
        it('should call getUserMedia and dispatch success if no stream exists', async () => {
            const { result } = renderUseMediasoup();

            await act(async () => {
                await result.current.getLocalStream();
            });

            expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith(mockSetMediaStream(mockMediaStream));
            // Check paramsRef update (indirectly testable via produce call later)
        });

        it('should not call getUserMedia if stream already exists', async () => {
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    mediaStreamSlice: { ...initialMediaStreamState, mediaStream: mockMediaStream },
                })
            );
            const { result } = renderUseMediasoup();

            await act(async () => {
                await result.current.getLocalStream();
            });

            expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalledWith(mockSetMediaStream(expect.anything()));
        });

        it('should handle getUserMedia error', async () => {
            const error = new Error('Permission denied');
            (mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(error);
            const { result } = renderUseMediasoup();

            await act(async () => {
                await result.current.getLocalStream();
            });

            expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
            expect(Alert.alert).toHaveBeenCalledWith('Camera Error', 'Unable to access camera and microphone.');
            expect(mockDispatch).not.toHaveBeenCalledWith(mockSetMediaStream(expect.anything()));
        });
    });

    describe('connect Flow', () => {
        let getRtpCapabilitiesCallback: (caps: any) => Promise<void>;
        let createTransportCallback: (transport: any) => void;

        beforeEach(() => {
            // Setup mocks to capture callbacks
            mockStreamSocketManagerInstance.createRoom.mockImplementation((createDeviceCb) => {
                getRtpCapabilitiesCallback = createDeviceCb; // Capture the callback
            });
            mockStreamSocketManagerInstance.createProducerTransport.mockImplementation((setTransportCb) => {
                createTransportCallback = setTransportCb; // Capture the callback
            });

            // Start with a stream available for connect tests
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    mediaStreamSlice: { ...initialMediaStreamState, mediaStream: mockMediaStream },
                })
            );
        });

        it('should dispatch connecting and call createRoom if no device', async () => {
            const { result } = renderUseMediasoup();

            await act(async () => {
                result.current.connect();
            });

            expect(mockDispatch).toHaveBeenCalledWith(mockSetIsConnecting(true));
            expect(mockStreamSocketManagerInstance.createRoom).toHaveBeenCalledTimes(1);
            expect(mockDevice.load).not.toHaveBeenCalled(); // Not yet
        });

        it('should create device when createRoom callback invoked', async () => {
            const { result } = renderUseMediasoup();
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };

            await act(async () => {
                result.current.connect(); // Calls createRoom
            });
            expect(getRtpCapabilitiesCallback).toBeDefined();

            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps); // Simulate server response
            });

            expect(mockDevice.load).toHaveBeenCalledWith({ routerRtpCapabilities: mockRtpCaps });
            // Device ref is set internally, check subsequent calls
        });

        it('should call createProducerTransport after device is created', async () => {
            const { result } = renderUseMediasoup();
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };

            // Full flow: connect -> createRoom -> callback -> createDevice -> createSendTransport
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            }); // Create device

            // Now call connect again (or modify test to check createSendTransport was called)
            // Let's assume connect calls createSendTransport if device exists
            mockDevice.loaded = true; // Simulate device exists for next connect call
            await act(async () => {
                result.current.connect();
            });

            expect(mockStreamSocketManagerInstance.createProducerTransport).toHaveBeenCalledTimes(1);
            expect(mockStreamSocketManagerInstance.createProducerTransport).toHaveBeenCalledWith(
                expect.any(Function), // setProducerTransport callback
                mockDevice // The device ref
            );
        });

        it('should connect transport and produce when transport is set via effect', async () => {
            const { result, rerender } = renderUseMediasoup();
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };

            // 1. Get stream
            await act(async () => {
                await result.current.getLocalStream();
            });
            // 2. Connect -> createRoom -> createDevice
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            });
            // 3. Connect again -> createProducerTransport
            mockDevice.loaded = true;
            await act(async () => {
                result.current.connect();
            });
            expect(createTransportCallback).toBeDefined();

            // 4. Simulate transport creation callback (sets the ref)
            await act(async () => {
                createTransportCallback(mockTransport);
            });

            // 5. Rerender or wait for useEffect to trigger connectSendTransport
            rerender({}); // Or use waitFor

            // 6. Assert produce was called
            expect(mockTransport.produce).toHaveBeenCalledTimes(1);
            expect(mockTransport.produce).toHaveBeenCalledWith(
                expect.objectContaining({
                    track: mockMediaStreamTrack, // Check track from paramsRef
                    // encodings: expect.any(Array) // Check other params
                })
            );

            // 7. Assert final state
            expect(mockDispatch).toHaveBeenCalledWith(mockSetIsConnecting(false)); // Should be false after success
            expect(mockDispatch).not.toHaveBeenCalledWith(mockSetConnectionError(expect.anything()));
            expect(mockProducer.on).toHaveBeenCalledWith('trackended', expect.any(Function));
            expect(mockProducer.on).toHaveBeenCalledWith('transportclose', expect.any(Function));
        });

        it('should handle produce error', async () => {
            const { result, rerender } = renderUseMediasoup();
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };
            const produceError = new Error('Produce failed');
            mockTransport.produce.mockRejectedValueOnce(produceError);

            // Setup: Get stream, create device, create transport
            await act(async () => {
                await result.current.getLocalStream();
            });
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            });
            mockDevice.loaded = true;
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                createTransportCallback(mockTransport);
            });

            // Rerender/wait for effect
            rerender({});
            await act(async () => {
                /* Allow promises to settle */
            }); // Wait for async rejection

            expect(mockTransport.produce).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith(mockSetIsConnecting(false)); // Reset connecting state
            expect(mockDispatch).toHaveBeenCalledWith(mockSetConnectionError(produceError.message));
            expect(Alert.alert).toHaveBeenCalledWith('Connection Error', 'Failed to establish streaming connection.');
            // Check if endStream was called (implicitly by checking close methods)
            expect(mockTransport.close).toHaveBeenCalled(); // endStream called on error
            expect(mockProducer.close).not.toHaveBeenCalled(); // Producer wasn't created
        });

        it('should dispatch error if connect called without stream', async () => {
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    mediaStreamSlice: { ...initialMediaStreamState, mediaStream: null }, // NO STREAM
                })
            );
            const { result } = renderUseMediasoup();

            await act(async () => {
                result.current.connect();
            });

            expect(mockDispatch).toHaveBeenCalledWith(mockSetIsConnecting(false));
            expect(mockDispatch).toHaveBeenCalledWith(mockSetConnectionError('No media stream available'));
            expect(mockStreamSocketManagerInstance.createRoom).not.toHaveBeenCalled();
        });
    });

    describe('endStream', () => {
        beforeEach(() => {
            // Simulate an active stream state
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    mediaStreamSlice: { ...initialMediaStreamState, mediaStream: mockMediaStream },
                })
            );
            // Simulate refs being set (would happen after successful connection)
            // This requires manually setting the refs in the test, which is awkward.
            // Better to test endStream after a simulated successful connection.
        });

        it('should stop tracks, close producer/transport, dispatch null stream, and navigate', async () => {
            const { result, rerender } = renderUseMediasoup();

            // --- Simulate successful connection first ---
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };
            let getRtpCapabilitiesCallback: (caps: any) => Promise<void>;
            let createTransportCallback: (transport: any) => void;
            mockStreamSocketManagerInstance.createRoom.mockImplementation((cb) => {
                getRtpCapabilitiesCallback = cb;
            });
            mockStreamSocketManagerInstance.createProducerTransport.mockImplementation((cb) => {
                createTransportCallback = cb;
            });
            await act(async () => {
                await result.current.getLocalStream();
            });
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            });
            mockDevice.loaded = true;
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                createTransportCallback(mockTransport);
            });
            rerender({}); // Let useEffect run produce
            await act(async () => {
                /* settle promises */
            });
            // --- Connection simulated ---

            // Now call endStream
            await act(async () => {
                result.current.endStream({}); // Default redirect = true
            });

            expect(mockMediaStreamTrack.stop).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith(mockSetMediaStream(null));
            expect(mockProducer.close).toHaveBeenCalled();
            expect(mockTransport.close).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith('/');
        });

        it('should not navigate if redirect is false', async () => {
            const { result, rerender } = renderUseMediasoup();
            // --- Simulate successful connection (as above) ---
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };
            let getRtpCapabilitiesCallback: (caps: any) => Promise<void>;
            let createTransportCallback: (transport: any) => void;
            mockStreamSocketManagerInstance.createRoom.mockImplementation((cb) => {
                getRtpCapabilitiesCallback = cb;
            });
            mockStreamSocketManagerInstance.createProducerTransport.mockImplementation((cb) => {
                createTransportCallback = cb;
            });
            await act(async () => {
                await result.current.getLocalStream();
            });
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            });
            mockDevice.loaded = true;
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                createTransportCallback(mockTransport);
            });
            rerender({});
            await act(async () => {
                /* settle promises */
            });
            // --- Connection simulated ---

            await act(async () => {
                result.current.endStream({ redirect: false });
            });

            expect(mockMediaStreamTrack.stop).toHaveBeenCalled();
            expect(mockProducer.close).toHaveBeenCalled();
            expect(mockTransport.close).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should handle being called when resources are already closed/null', async () => {
            const { result } = renderUseMediasoup();
            // No stream, no refs set initially

            await act(async () => {
                result.current.endStream({});
            });

            expect(mockMediaStreamTrack.stop).not.toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalledWith(mockSetMediaStream(null)); // Already null
            expect(mockProducer.close).not.toHaveBeenCalled();
            expect(mockTransport.close).not.toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith('/'); // Still navigates if called directly
        });
    });

    describe('Cleanup', () => {
        it('should call endStream on unmount', async () => {
            const { result, unmount, rerender } = renderUseMediasoup();
            // --- Simulate successful connection (as above) ---
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };
            let getRtpCapabilitiesCallback: (caps: any) => Promise<void>;
            let createTransportCallback: (transport: any) => void;
            mockStreamSocketManagerInstance.createRoom.mockImplementation((cb) => {
                getRtpCapabilitiesCallback = cb;
            });
            mockStreamSocketManagerInstance.createProducerTransport.mockImplementation((cb) => {
                createTransportCallback = cb;
            });
            await act(async () => {
                await result.current.getLocalStream();
            });
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            });
            mockDevice.loaded = true;
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                createTransportCallback(mockTransport);
            });
            rerender({});
            await act(async () => {
                /* settle promises */
            });
            // --- Connection simulated ---

            // Clear mocks before unmount to check calls during unmount
            jest.clearAllMocks();
            mockUseAppDispatch.mockReturnValue(mockDispatch); // Re-assign mock dispatch

            act(() => {
                unmount();
            });

            expect(mockMediaStreamTrack.stop).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith(mockSetMediaStream(null));
            expect(mockProducer.close).toHaveBeenCalled();
            expect(mockTransport.close).toHaveBeenCalled();
            // expect(router.navigate).toHaveBeenCalledWith('/'); // Check if unmount should navigate
        });
    });

    describe('Event Listeners', () => {
        it('should call endStream({ redirect: false }) on trackended', async () => {
            const { result, rerender } = renderUseMediasoup();
            // --- Simulate successful connection (as above) ---
            const mockRtpCaps = { codecs: [{ kind: 'video' }] };
            let getRtpCapabilitiesCallback: (caps: any) => Promise<void>;
            let createTransportCallback: (transport: any) => void;
            mockStreamSocketManagerInstance.createRoom.mockImplementation((cb) => {
                getRtpCapabilitiesCallback = cb;
            });
            mockStreamSocketManagerInstance.createProducerTransport.mockImplementation((cb) => {
                createTransportCallback = cb;
            });
            await act(async () => {
                await result.current.getLocalStream();
            });
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                await getRtpCapabilitiesCallback(mockRtpCaps);
            });
            mockDevice.loaded = true;
            await act(async () => {
                result.current.connect();
            });
            await act(async () => {
                createTransportCallback(mockTransport);
            });
            rerender({});
            await act(async () => {
                /* settle promises */
            });
            // --- Connection simulated ---

            // Find the trackended listener and trigger it
            const trackEndedListener = mockProducer.on.mock.calls.find((call) => call[0] === 'trackended')?.[1];
            expect(trackEndedListener).toBeDefined();

            // Clear mocks before triggering
            jest.clearAllMocks();

            await act(async () => {
                trackEndedListener();
            });

            expect(mockMediaStreamTrack.stop).toHaveBeenCalled();
            expect(mockProducer.close).toHaveBeenCalled();
            expect(mockTransport.close).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled(); // redirect: false
        });

        // Add similar test for 'transportclose' event
    });
});
