"use client"

import { useAppSelector } from "@/redux/hooks";
import { Quiz } from "@/Types";
import QuizCard from "./quizCard";
import { userApiService } from "@/redux/services/apiService";
import { useState, useEffect } from "react";

export default function HostingList() {
  const userId = useAppSelector((state) => state.userIdSlice.value)
  const allQuizzes = useAppSelector((state) => state.discoverSlice.value);
  const hostingQuizzes = allQuizzes.filter((quiz) => quiz.quizOwner === userId);

  return (
    <div className="quiz-list-container">
      { hostingQuizzes.map((quizItem:Quiz) => 
      <div key={quizItem.id}>
        <QuizCard quiz={quizItem}/>
      </div>
      )}
    </div>
  )
}