import { describe, it, expect } from "vitest";
import request, { Response } from "supertest";
import app from "@/index";

describe("Rate Limiter Middleware", () => {
  it("should return 429 after exceeding 30 requests per minute on /check-url", async () => {
    let res!: Response;
    for (let i = 0; i < 31; i++) {
      res = await request(app)
        .post("/api/check-url")
        .send({ url: "https://httpbin.org/status/200" });
    }
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Too many requests, please try again later.");
  });

  it("should return 429 after exceeding 30 requests per minute on /check-urls", async () => {
    let res!: Response;
    for (let i = 0; i < 31; i++) {
      res = await request(app)
        .post("/api/check-urls")
        .send({ urls: ["https://httpbin.org/status/200"] });
    }
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Too many requests, please try again later.");
  });
}, 15000);
