import { beforeEach, describe, it, expect } from "vitest";
import request, { Response } from "supertest";
import app from "@/index";
import { rateLimiter } from "@/middleware/rateLimiter/rateLimiter";

const TEST_IP = "::ffff:127.0.0.1";

async function assertRateLimit(endpoint: string, payload: object) {
  let res!: Response;
  for (let i = 0; i < 31; i++) {
    res = await request(app).post(endpoint).send(payload);
  }
  expect(res.status).toBe(429);
  expect(res.body.success).toBe(false);
  expect(res.body.error).toBe("Too many requests, please try again later.");
}

describe("Rate Limiter Middleware", () => {
  beforeEach(() => {
    rateLimiter.resetKey(TEST_IP);
  });

  it("should return 429 on /check-url after exceeding the limit", async () => {
    await assertRateLimit("/api/check-url", {
      url: "https://httpbin.org/status/200",
    });
  });

  it("should return 429 on /check-urls after exceeding the limit", async () => {
    await assertRateLimit("/api/check-urls", {
      urls: ["https://httpbin.org/status/200"],
    });
  });
}, 15000);
