import HostStream from '@/src/components/hostStream';
import * as questionSlice from '@/src/features/questionSlice';
import * as quizSlice from '@/src/features/quizSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks';
import { useMediasoup } from '@/src/hooks/useMediasoupProducer';
import { RTCView, mockMediaStream } from '@/src/mocks/react-native-webrtc';
import { MediaStreamBroadcaster } from '@/src/services/mediaStreamBroadcaster';
import { QuizBroadcasterManager } from '@/src/services/quizBroadcasterManager';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock Redux hooks
jest.mock('@/src/hooks/reduxHooks');
const mockDispatch = jest.fn();
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;

// Mock useMediasoup hook
jest.mock('@/src/hooks/useMediasoup');
const mockUseMediasoup = useMediasoup as jest.Mock;
const mockGetLocalStream = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn();
const mockEndStream = jest.fn();

// Mock Service Managers
jest.mock('@/src/services/quizBroadcasterManager');
const MockQuizBroadcasterManager = QuizBroadcasterManager as jest.MockedClass<typeof QuizBroadcasterManager>;
let mockQuizSocketManagerInstance: jest.Mocked<QuizBroadcasterManager>;

jest.mock('@/src/services/mediaStreamBroadcaster');
const MockMediaStreamBroadcaster = MediaStreamBroadcaster as jest.MockedClass<typeof MediaStreamBroadcaster>;
let mockStreamSocketManagerInstance: jest.Mocked<MediaStreamBroadcaster>;

// Mock Components
jest.mock('@/src/components/hostQuestion', () => ({
    HostQuestion: jest.fn(() => <div data-testid="mock-host-question" />),
}));

// Mock Slice Actions
const mockIncrementQuestionNumber = jest.fn(() => ({ type: 'incrementQuestionNumber' }));
const mockSetQuizStarted = jest.fn((payload) => ({ type: 'setQuizStarted', payload }));
const mockSetQuestionHidden = jest.fn((payload) => ({ type: 'setQuestionHidden', payload }));
const mockIncrementTrigger = jest.fn(() => ({ type: 'incrementTrigger' }));
jest.spyOn(questionSlice, 'incrementQuestionNumber').mockImplementation(mockIncrementQuestionNumber as any);
jest.spyOn(quizSlice, 'setQuizStarted').mockImplementation(mockSetQuizStarted as any);
jest.spyOn(quizSlice, 'setQuestionHidden').mockImplementation(mockSetQuestionHidden as any);
jest.spyOn(quizSlice, 'incrementTrigger').mockImplementation(mockIncrementTrigger as any);

describe('HostStream Component', () => {
    const quizId = 'test-quiz-123';
    const initialState = {
        questionSlice: { value: 0 },
        quizSlice: { quizStarted: false, questionHidden: true, trigger: 0 },
        mediaStreamSlice: { mediaStream: null, isConnecting: false, connectionError: null },
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset hook mocks
        mockUseMediasoup.mockReturnValue({
            getLocalStream: mockGetLocalStream,
            connect: mockConnect,
            endStream: mockEndStream,
        });

        // Reset service mocks and capture instances
        MockQuizBroadcasterManager.mockClear();
        MockQuizBroadcasterManager.withReduxDispatch = jest.fn().mockImplementation(() => {
            mockQuizSocketManagerInstance = new MockQuizBroadcasterManager(mockDispatch) as jest.Mocked<QuizBroadcasterManager>;
            // Manually mock methods on the instance if needed, e.g.:
            mockQuizSocketManagerInstance.setupAllListeners = jest.fn();
            mockQuizSocketManagerInstance.removeAllListeners = jest.fn();
            mockQuizSocketManagerInstance.disconnect = jest.fn();
            mockQuizSocketManagerInstance.startQuiz = jest.fn();
            mockQuizSocketManagerInstance.nextQuestion = jest.fn();
            mockQuizSocketManagerInstance.showWinners = jest.fn();
            return mockQuizSocketManagerInstance;
        });

        MockMediaStreamBroadcaster.mockClear();
        // Need to ensure the constructor mock allows creating an instance
        MockMediaStreamBroadcaster.mockImplementation(() => {
            mockStreamSocketManagerInstance = {
                setupConnectionListener: jest.fn(),
                removeConnectionListener: jest.fn(),
                disconnect: jest.fn(),
                // Add other methods used by the component if any
            } as unknown as jest.Mocked<MediaStreamBroadcaster>;
            return mockStreamSocketManagerInstance;
        });

        mockUseAppDispatch.mockReturnValue(mockDispatch);
        mockUseAppSelector.mockImplementation((selector) => selector(initialState));
    });

    const renderHostStream = () => {
        return render(<HostStream quizId={quizId} />);
    };

    it('should render initial state correctly', () => {
        const { getByText, queryByTestId } = renderHostStream();

        expect(getByText('Start Quiz')).toBeTruthy();
        expect(getByText('Start Video')).toBeTruthy();
        expect(getByText('Stream')).toBeTruthy();
        expect(getByText('End Stream')).toBeTruthy();
        expect(queryByTestId('mock-host-question')).toBeNull();
        expect(queryByTestId('mock-rtc-view')).toBeTruthy();
        expect(RTCView).toHaveBeenCalledWith(expect.objectContaining({ streamURL: null }), {});
    });

    it('should call setup listeners and getLocalStream on mount', () => {
        renderHostStream();
        expect(mockQuizSocketManagerInstance.setupAllListeners).toHaveBeenCalledWith(quizId);
        expect(mockStreamSocketManagerInstance.setupConnectionListener).toHaveBeenCalledTimes(1);
        expect(mockGetLocalStream).toHaveBeenCalledTimes(1);
    });

    it('should call cleanup functions on unmount', () => {
        const { unmount } = renderHostStream();
        unmount();
        expect(mockQuizSocketManagerInstance.removeAllListeners).toHaveBeenCalledTimes(1);
        expect(mockQuizSocketManagerInstance.disconnect).toHaveBeenCalledTimes(1);
        expect(mockStreamSocketManagerInstance.removeConnectionListener).toHaveBeenCalledTimes(1);
        expect(mockStreamSocketManagerInstance.disconnect).toHaveBeenCalledTimes(1);
        // endStream cleanup is handled within useMediasoup hook test
    });

    it('should render RTCView with stream URL when mediaStream exists', () => {
        mockUseAppSelector.mockImplementation((selector) =>
            selector({
                ...initialState,
                mediaStreamSlice: { ...initialState.mediaStreamSlice, mediaStream: mockMediaStream },
            })
        );
        renderHostStream();
        expect(RTCView).toHaveBeenCalledWith(expect.objectContaining({ streamURL: 'mock-stream-url' }), {});
    });

    it('should show "Connecting..." when isConnecting is true', () => {
        mockUseAppSelector.mockImplementation((selector) =>
            selector({
                ...initialState,
                mediaStreamSlice: { ...initialState.mediaStreamSlice, isConnecting: true },
            })
        );
        const { getByText } = renderHostStream();
        expect(getByText('Connecting...')).toBeTruthy();
    });

    describe('User Interactions', () => {
        it('should call getLocalStream when "Start Video" is pressed', () => {
            const { getByText } = renderHostStream();
            fireEvent.press(getByText('Start Video'));
            expect(mockGetLocalStream).toHaveBeenCalledTimes(2); // Once on mount, once on press
        });

        it('should call connect when "Stream" is pressed', () => {
            // Need mediaStream to enable the button
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    mediaStreamSlice: { ...initialState.mediaStreamSlice, mediaStream: mockMediaStream },
                })
            );
            const { getByText } = renderHostStream();
            fireEvent.press(getByText('Stream'));
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        it('should call endStream when "End Stream" is pressed', () => {
            // Need mediaStream to enable the button
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    mediaStreamSlice: { ...initialState.mediaStreamSlice, mediaStream: mockMediaStream },
                })
            );
            const { getByText } = renderHostStream();
            fireEvent.press(getByText('End Stream'));
            expect(mockEndStream).toHaveBeenCalledWith({}); // Default args
        });

        it('should call startQuiz and dispatch actions when "Start Quiz" is pressed', () => {
            const { getByText } = renderHostStream();
            fireEvent.press(getByText('Start Quiz'));
            expect(mockDispatch).toHaveBeenCalledWith(mockSetQuizStarted(true));
            expect(mockQuizSocketManagerInstance.startQuiz).toHaveBeenCalledWith(quizId);
            expect(mockDispatch).toHaveBeenCalledWith(mockIncrementQuestionNumber());
        });

        it('should render "Next Question" and HostQuestion when quiz started', () => {
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    quizSlice: { ...initialState.quizSlice, quizStarted: true },
                    questionSlice: { value: 1 }, // Question 1
                })
            );
            const { getByText, getByTestId } = renderHostStream();
            expect(getByText('Next Question')).toBeTruthy();
            expect(getByTestId('mock-host-question')).toBeTruthy();
        });

        it('should call nextQuestion and dispatch actions when "Next Question" is pressed', () => {
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    quizSlice: { ...initialState.quizSlice, quizStarted: true },
                    questionSlice: { value: 1 },
                })
            );
            const { getByText } = renderHostStream();
            fireEvent.press(getByText('Next Question'));

            expect(mockDispatch).toHaveBeenCalledWith(mockIncrementQuestionNumber());
            expect(mockDispatch).toHaveBeenCalledWith(mockIncrementTrigger());
            expect(mockQuizSocketManagerInstance.nextQuestion).toHaveBeenCalledWith(quizId);
            expect(mockDispatch).toHaveBeenCalledWith(mockSetQuestionHidden(false));
        });

        it('should render "Reveal Winners" at question 10', () => {
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    quizSlice: { ...initialState.quizSlice, quizStarted: true },
                    questionSlice: { value: 10 }, // Last question
                })
            );
            const { getByText } = renderHostStream();
            expect(getByText('Reveal Winners')).toBeTruthy();
        });

        it('should call showWinners and dispatch when "Reveal Winners" is pressed', () => {
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    quizSlice: { ...initialState.quizSlice, quizStarted: true },
                    questionSlice: { value: 10 },
                })
            );
            const { getByText } = renderHostStream();
            fireEvent.press(getByText('Reveal Winners'));

            expect(mockQuizSocketManagerInstance.showWinners).toHaveBeenCalledWith(quizId);
            expect(mockDispatch).toHaveBeenCalledWith(mockIncrementQuestionNumber()); // Increments past 10
        });

        it('should disable buttons appropriately', () => {
            // Example: Stream button disabled if no mediaStream or isConnecting
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    mediaStreamSlice: { mediaStream: null, isConnecting: false, connectionError: null },
                })
            );
            const { getByText } = renderHostStream();
            expect(getByText('Stream').props.accessibilityState.disabled).toBe(true);
            expect(getByText('End Stream').props.accessibilityState.disabled).toBe(true);
            expect(getByText('Start Video').props.accessibilityState.disabled).toBe(false); // Can always try to start video

            // Example: Stream button disabled if connecting
            mockUseAppSelector.mockImplementation((selector) =>
                selector({
                    ...initialState,
                    mediaStreamSlice: { mediaStream: mockMediaStream, isConnecting: true, connectionError: null },
                })
            );
            renderHostStream(); // Re-render with new state
            expect(getByText('Connecting...').props.accessibilityState.disabled).toBe(true);
        });
    });
});
