import React, { useState, useEffect } from 'react';
import QuizLoadingLayout from './layout';

export default function QuizLoadingPage() {
    // Redux hooks to fetch and display quiz's details

    return (
        <QuizLoadingLayout>
            {/* Static placeholders for now */}
            <div>
                Quiz Name: Next Big Quiz
                <br />
                Quiz Host: John Doe
                <br />
                Quiz Category: General Knowledge
            </div>
            <div>
                STARTING, IN:
                <br />
                XX:XX:XX
            </div>
        </QuizLoadingLayout>
    );
}
