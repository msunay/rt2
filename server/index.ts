import express from "express";
import cors from "cors";
import router from "./router";

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? process.env.CORS_ORIGIN : 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

export default app;
