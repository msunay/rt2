import { useGetOneParticipationByPartIdQuery, useGetOneQuizQuery, useGetOneQuizQuestionAnswerQuery } from '@/src/api/backendApi';
import { ParticipantStreamNew } from '@/src/components/participantStream';
import { useAppSelector } from '@/src/hooks/reduxHooks';
import { QUIZ_BACKGROUND } from '@/src/utils/images';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function ParticipantStreamPage() {
    // Get participation id from route slug.
    const { partId } = useLocalSearchParams<{ partId: string }>();

    const { data: participation } = useGetOneParticipationByPartIdQuery(partId);

    const { data: quiz } = useGetOneQuizQuestionAnswerQuery(participation?.QuizId ?? '');
    const { quizStarted, currentQuestionNumber, questionHidden } = useAppSelector((state) => state.quizSlice);

    return (
        <ImageBackground source={QUIZ_BACKGROUND.background} style={styles.background}>
            {participation && quiz ? (
                <ParticipantStreamNew
                    participation={participation}
                    quiz={quiz}
                    quizStarted={quizStarted}
                    currentQuestionNumber={currentQuestionNumber}
                    questionHidden={questionHidden}
                    useIce={true}
                />
            ) : null}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'flex-end',
    },
});
