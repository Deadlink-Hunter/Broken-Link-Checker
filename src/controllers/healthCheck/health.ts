import { Request, Response } from "express";
import { HEALTH_CHECK_MESSAGE } from "@constant";

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: HEALTH_CHECK_MESSAGE,
    timestamp: new Date().toISOString(),
  });
};
