import {
  URL_RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_MESSAGE,
  URL_RATE_LIMIT_WINDOW_MS,
} from "@/constants";
import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: URL_RATE_LIMIT_WINDOW_MS,
  limit: URL_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGE,
  },
});
