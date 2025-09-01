import express from "express";
import cors from "cors";
import router from "@/router";
import http from "http";
import { Namespace, Server } from "socket.io";
import quizSocketInit from "@/controllers/quiz.socket.controller";
import type {
  BroadcastListenEvents,
  BroadcastEmitEvents,
} from "@/Types/BroadcastSocketTypes";
import type { QuizEmitEvents, QuizListenEvents } from "@/Types/QuizSocketTypes";
import { instrument } from "@socket.io/admin-ui";
import { BroadcastSocketController } from "./controllers/broadcastSocketController";
import { MediaSoupService } from "./services/mediasoupService";
import { config } from "./config";

const app = express();

const corsOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN
    : "http://172.19.130.185:8081";

const corsOptions = {
  // origin: '*',
  origin: [corsOrigin!, "https://admin.socket.io"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

export const server = http.createServer(app);

const io = new Server(server, {
  // cors: {
  //   origin:
  //     [corsOrigin!, "https://admin.socket.io", '*'],
  //   methods: ['GET', 'POST'],
  //   credentials: true,
  // },
});

const broadcastNamespace: Namespace<
  BroadcastListenEvents,
  BroadcastEmitEvents
> = io.of("/mediasoup");

const quizNamespace: Namespace<QuizListenEvents, QuizEmitEvents> =
  io.of("/quizspace");

const mediaSoupService = new MediaSoupService(config.mediasoup);

mediaSoupService.initialize().then(() => {
  broadcastNamespace.on("connection", (socket) =>
    new BroadcastSocketController(socket, mediaSoupService)
  );
});

quizNamespace.on("connection", (socket) =>
  quizSocketInit(socket, quizNamespace)
);

// instrument(io, { auth: false, mode: "development" });
