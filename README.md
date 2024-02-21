# Real Time Trivia - Livestream Quiz Platform

Welcome to Real Time Trivia, a platform that enables users to create, host, and participate in livestream quizzes. This README provides an overview of the project, its key features, the technologies used, and information on the project's deployment.

## Table of Contents

- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Getting Started](#getting-started)
- [Team Members](#team-members)

## Introduction

Real Time Trivia is an interactive platform designed to facilitate engaging livestream quizzes. Users can both create and play quizzes, competing against one another to earn points. With features like live scoring and real-time communication, the platform aims to provide an immersive trivia experience.

## Technologies Used

### Frontend

- **React Native:** A popular React framework offering server-side rendering and other advanced features.
- **TypeScript:** A statically typed superset of JavaScript that enhances code quality and readability.
- **Redux Toolkit:** A set of tools for efficient Redux development, managing the application's state.
- **RTK Query:** A data fetching and caching tool for making API requests.
- **Web Sockets:** Real-time communication technology for interactive features.
- **Web RTC:** A technology enabling live-streaming.

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
3. Whilst in `/client` copy `.env.example` to a `.env.local` file and fill in variables (You can find your local by continuing through to step 10 to see the ip Metro is using when the expo server is running).

```
cd client
cp .env.example .env
```
4. Similarly, set up the backend by going to the backend directory and running `npm install`.

```
cd rt2/server
npm install
```

5. Create a PostgreSQL database for the application.
6. Whilst in `/server` copy `.env.example` to a `.env` file and fill in variables.

```
cd server
cp .env.example .env
```
7. Start the backend server using `npm run dev` in the backend directory.

```
cd rt2/server
npm run dev
```

8. Populate the database with mock data by running this command in the `/server` directory.

```
npm run populate
```
9. Download Expo Go on your device from either the Android Play Store or iOS App Store.
10. Start the frontend development server using `npx expo start` in the `/client` directory.

```
cd rt2/client
npx expo start
```

11. Scan the QR code with either the Expo Go app (on Android) or with your camera (on IOS) to open the app


## Team Members

Real Time Trivia was developed by a dedicated team of developers:

- Thiago Los [LinkedIn](https://www.linkedin.com/in/thiagolos/)
- Alex Eze [LinkedIn](https://www.linkedin.com/in/alex-eze-dev/)
- Atai Ismaiilov [LinkedIn](https://www.linkedin.com/in/atai-ismaiilov-185a0b1a8/)
- Carlos Bárcena Bescansa [LinkedIn](https://www.linkedin.com/in/carlos-b%C3%A1rcena-bescansa-b0768ab3/)
