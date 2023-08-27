# Real Time Trivia - Livestream Quiz Platform

Welcome to Real Time Trivia, a platform that enables users to create, host, and participate in livestream quizzes. This README provides an overview of the project, its key features, the technologies used, and information on the project's deployment.

## Table of Contents

- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Team Members](#team-members)

## Introduction

Real Time Trivia is an interactive platform designed to facilitate engaging livestream quizzes. Users can both create and play quizzes, competing against one another to earn points. With features like live scoring and real-time communication, the platform aims to provide an immersive trivia experience.

## Technologies Used

### Frontend

- **Next.js 13:** A popular React framework offering server-side rendering and other advanced features.
- **TypeScript:** A statically typed superset of JavaScript that enhances code quality and readability.
- **Redux Toolkit:** A set of tools for efficient Redux development, managing the application's state.
- **Web Sockets:** Real-time communication technology for interactive features.
- **Web RTC:** A technology enabling real-time communication in the browser.
- **Axios:** A promise-based HTTP client for making API requests.

### Backend

- **PostgreSQL:** A powerful open-source relational database system.
- **Sequelize:** A promise-based ORM (Object-Relational Mapping) for managing database interactions.
- **Express.js:** A fast, unopinionated web framework for Node.js.
- **TypeScript:** Used for the backend to bring static typing and better tooling to Node.js development.
- **JWT Authentication:** Securing routes and managing user sessions using JSON Web Tokens.

### Testing

- **Cypress:** End-to-end testing framework for ensuring application behavior.
- **Jest:** A JavaScript testing framework for unit testing.
- **Supertest:** A library for testing HTTP assertions.
- **Socket.io Client:** Testing Socket.io interactions on the client side.

## Features

- **Quiz Creation:** Users can create their own quizzes, specifying questions, options, and correct answers.
- **Livestream Hosting:** Hosts can set up and conduct live quizzes, engaging participants in real time.
- **Interactive Gameplay:** Participants can answer questions in real time and see their scores update dynamically.
- **Leaderboard:** The top scorers of each quiz are showcased on a leaderboard.
- **Real-time Communication:** Web Sockets and Web RTC enable seamless real-time interaction between hosts and participants.

## Getting Started

To begin using Real Time Trivia, follow these steps:

1. Clone this repository.
  ```
  git clone https://github.com/msunay/rt2.git
  ```
2. Set up the frontend by navigating to the frontend directory and running `npm install`.
  ```
  cd rt2/client
  npm install
  ```
3. Similarly, set up the backend by going to the backend directory and running `npm install`.
  ```
  cd rt2/server
  npm install
  ```
4. Create a PostgreSQL database for the application and update the connection configuration in the backend's `.env` file.
5. Obtain and set up JWT secret and other environment variables in the backend's `.env` file.
6. Start the backend server using `npm run dev` in the backend directory.
  ```
  cd rt2/server
  npm run dev
  ```
7. Start the frontend development server using `npm run dev` in the `/frontend` directory.
  ```
  cd rt2/client
  npm run dev
  ```
8. Populate the database with mock data.
  ```
  cd server
  npm run populate
  ```

## Deployment

The Real Time Trivia application is deployed at [real-time-trivia.app](https://www.real-time-trivia.app). Visit the deployment to experience the quizzes firsthand.

## Team Members

Real Time Trivia was developed by a dedicated team of developers:
- Thiago Los [LinkedIn](https://www.linkedin.com/in/thiagolos/)
- Alex Eze [LinkedIn](https://www.linkedin.com/in/alex-eze-822255a7/)
- Atai Ismaiilov [LinkedIn](https://www.linkedin.com/in/atai-ismaiilov-185a0b1a8/)
- Carlos Bárcena Bescansa [LinkedIn](https://www.linkedin.com/in/carlos-b%C3%A1rcena-bescansa-b0768ab3/)
