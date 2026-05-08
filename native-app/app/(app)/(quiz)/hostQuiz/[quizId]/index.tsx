import { HostStream } from '@/src/components/hostStream';
import { incrementQuestionNumber, incrementTrigger, setQuestionHidden, setQuizStarted } from '@/src/features/quizSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks';
import { QuizBroadcasterManager } from '@/src/services/quizBroadcasterManager';
import { QUIZ_BACKGROUND } from '@/src/utils/images';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function HostStreamPage() {
    // Get quizId from route slug.
    const { quizId } = useLocalSearchParams<{ quizId: string }>();

    const dispatch = useAppDispatch();
    const { quizStarted, questionHidden } = useAppSelector((state) => state.quizSlice);
    const currentQuestionNumber = useAppSelector((state) => state.questionSlice.value);

    const quizSocketManager = useMemo(() => QuizBroadcasterManager.withReduxDispatch(dispatch), [dispatch]);

    return (
        <ImageBackground source={QUIZ_BACKGROUND.background} style={styles.background}>
            <HostStream
                quizId={quizId}
                quizStarted={quizStarted}
                currentQuestionNumber={currentQuestionNumber}
                questionHidden={questionHidden}
                onStartQuiz={() => {
                    dispatch(setQuizStarted(true));
                    quizSocketManager.startQuiz(quizId);
                    dispatch(incrementQuestionNumber());
                }}
                onNextQuestion={() => {
                    dispatch(incrementQuestionNumber());
                    dispatch(incrementTrigger());
                    quizSocketManager.nextQuestion(quizId);
                    dispatch(setQuestionHidden(false));
                }}
                onShowWinners={() => {
                    quizSocketManager.showWinners(quizId);
                }}
                useIce={true}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'flex-end',
        // paddingBottom: 50,
        // borderWidth: 1,
    },
    // camera: {
    //   flex: 1,
    // },
});
