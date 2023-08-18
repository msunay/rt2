import React, { ReactNode } from 'react';

type QuizLoadingLayoutProps = {
    children: ReactNode;
};

const QuizLoadingLayout: React.FC<QuizLoadingLayoutProps> = ({ children }) => {
    return (
        <div className="quiz-loading-layout">
            {/* Add header later */}
            <div className="content">
                {children}
            </div>
        </div>
    );
}

export default QuizLoadingLayout;

