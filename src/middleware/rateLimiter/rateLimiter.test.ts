import express from "express";
import { beforeEach, describe, it, expect } from "vitest";
import request, { Response } from "supertest";
import { rateLimiter } from "@/middleware/rateLimiter/rateLimiter";
import { URL_RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_MESSAGE } from "@/constants";

const TEST_IP = "127.0.0.1";

const app = express();
app.use(express.json());
app.use(rateLimiter);
app.post("/api/check-url", (_req, res) =>
  res.status(200).json({ success: true }),
);
app.post("/api/check-urls", (_req, res) =>
  res.status(200).json({ success: true }),
);

async function assertRateLimit(
  endpoint: string,
  payload: object,
  limit: number,
) {
  let res: Response;
  for (let i = 0; i < limit; i++) {
    res = await request(app).post(endpoint).send(payload);
    expect(res.status).not.toBe(429);
  }
  res = await request(app).post(endpoint).send(payload);
  expect(res.status).toBe(429);
  expect(res.body.success).toBe(false);
  expect(res.body.error).toBe(RATE_LIMIT_MESSAGE);
}

describe("Rate Limiter Middleware", () => {
  beforeEach(() => {
    rateLimiter.resetKey(TEST_IP);
  });

  it("should return 429 on /check-url after exceeding the limit", async () => {
    await assertRateLimit(
      "/api/check-url",
      {
        url: "https://example.com",
      },
      URL_RATE_LIMIT_MAX_REQUESTS,
    );
  });

  it("should return 429 on /check-urls after exceeding the limit", async () => {
    await assertRateLimit(
      "/api/check-urls",
      {
        urls: ["https://example.com"],
      },
      URL_RATE_LIMIT_MAX_REQUESTS,
    );
  });
});
