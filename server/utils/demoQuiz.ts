import { Request, Response } from 'express';
import models from '../models/index';

export async function addDemoQuiz(req: Request, res: Response) {
  try {
    console.log('REQUEST ::', req);
    const quiz = await models.Quiz.create({
      quizName: 'Demo Quiz',
      quizOwner: req.body.ownerId,
      category: 'Thesis Project',
      dateTime: req.body.startTime,
    });

    async function createQuestionWithAnswers(
      questionText: string,
      answers: string[],
      correctIndex: number,
      positionInQuiz: number
    ) {
      const question = await models.Question.create({
        questionText,
        positionInQuiz,
      });

      answers.forEach((answer, index) => {
        question.createAnswer({
          answerText: answer,
          isCorrect: index === correctIndex,
        });
      });
      await quiz.addQuestion(question);
    }

    // Question 1
    const question1Answers = [
      'Answer 1 for question 1',
      'Answer 2 for question 1',
      'Answer 3 for question 1',
      'Answer 4 for question 1',
    ];
    await createQuestionWithAnswers('Question 1', question1Answers, 0, 1);

    // Question 2
    const question2Answers = [
      'Answer 1 for question 2',
      'Answer 2 for question 2',
      'Answer 3 for question 2',
      'Answer 4 for question 2',
    ];
    await createQuestionWithAnswers('Question 2', question2Answers, 0, 2);

    // Question 3
    const question3Answers = [
      'Answer 1 for question 3',
      'Answer 2 for question 3',
      'Answer 3 for question 3',
      'Answer 4 for question 3',
    ];
    await createQuestionWithAnswers('Question 3', question3Answers, 0, 3);

    // Question 4
    const question4Answers = [
      'Answer 1 for question 4',
      'Answer 2 for question 4',
      'Answer 3 for question 4',
      'Answer 4 for question 4',
    ];
    await createQuestionWithAnswers('Question 4', question4Answers, 0, 4);

    // Question 5
    const question5Answers = [
      'Answer 1 for question 5',
      'Answer 2 for question 5',
      'Answer 3 for question 5',
      'Answer 4 for question 5',
    ];
    await createQuestionWithAnswers('Question 5', question5Answers, 0, 5);

    // Question 6
    const question6Answers = [
      'Answer 1 for question 6',
      'Answer 2 for question 6',
      'Answer 3 for question 6',
      'Answer 4 for question 6',
    ];
    await createQuestionWithAnswers('Question 6', question6Answers, 0, 6);

    // Question 7
    const question7Answers = [
      'Answer 1 for question 7',
      'Answer 2 for question 7',
      'Answer 3 for question 7',
      'Answer 4 for question 7',
    ];
    await createQuestionWithAnswers('Question 7', question7Answers, 0, 7);

    // Question 8
    const question8Answers = [
      'Answer 1 for question 8',
      'Answer 2 for question 8',
      'Answer 3 for question 8',
      'Answer 4 for question 8',
    ];
    await createQuestionWithAnswers('Question 8', question8Answers, 0, 8);

    // Question 9
    const question9Answers = [
      'Answer 1 for question 9',
      'Answer 2 for question 9',
      'Answer 3 for question 9',
      'Answer 4 for question 9',
    ];
    await createQuestionWithAnswers('Question 9', question9Answers, 0, 9);

    // Question 10
    const question10Answers = [
      'Answer 1 for question 10',
      'Answer 2 for question 10',
      'Answer 3 for question 10',
      'Answer 4 for question 10',
    ];
    await createQuestionWithAnswers('Question 10', question10Answers, 0, 10);
    res.status(201).send(quiz);
  } catch (err) {
    console.error('Unable to create quiz:', err);
    res.status(500).send();
  }
}
