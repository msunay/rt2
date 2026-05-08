import { generateTurnCredentials } from "@/utils/coturn";
import type { Request, Response } from "express";

function getTurnCredentials(req: Request, res: Response) {
  const staticAuthSecret = "ETDEn42c2_P7q2o@4XF687kEpUzFGZ";
  try {
    const turnCreds = generateTurnCredentials(staticAuthSecret);

    res.status(200).send(turnCreds);
  } catch (error) {
    console.error("Error generating TURN credentials:", error);
    res.status(500).send();
  }
}

export default {
  getTurnCredentials,
};
