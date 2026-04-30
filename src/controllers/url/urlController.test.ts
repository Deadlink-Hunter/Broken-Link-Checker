import { beforeEach, describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import request from "supertest";
import app from "../../index";
import { UrlCheckResult } from "@/services/urlService";
import { server } from "@/mocks/server";

describe("URL Controller Endpoints", () => {
  beforeEach(() => {
    server.use(
      http.get("https://google.com", () =>
        HttpResponse.html(
          "<html><head><title>Google</title></head><body>ok</body></html>",
        ),
      ),
    );
  });

  describe("POST /api/check-url", () => {
    it("should return isBroken: false for a working URL", async () => {
      const res = await request(app)
        .post("/api/check-url")
        .send({ url: "https://google.com" });

      expect(res.status).toBe(200);
      expect(res.body.data.isBroken).toBe(false);
    });

    it("should return isBroken: true for a broken URL", async () => {
      server.use(
        http.get("https://site-that-does-not-exist-123.com", () =>
          HttpResponse.error(),
        ),
      );

      const res = await request(app)
        .post("/api/check-url")
        .send({ url: "https://site-that-does-not-exist-123.com" });

      expect(res.status).toBe(200);
      expect(res.body.data.isBroken).toBe(true);
    });

    it("should return 400 if URL is missing", async () => {
      const res = await request(app).post("/api/check-url").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("POST /api/check-urls", () => {
    it("should handle multiple URLs successfully", async () => {
      const validUrl = "https://google.com";
      const invalidUrl = "not_real_url.com";
      const urls = [validUrl, invalidUrl];

      const res = await request(app).post("/api/check-urls").send({ urls });

      const results: UrlCheckResult[] = res.body.data.results;

      expect(res.status).toBe(200);
      expect(Array.isArray(results)).toBe(true);
      expect(res.body.data.summary.total).toBe(urls.length);
      expect(typeof res.body.data.summary.scanDuration).toBe("number");
      expect(res.body.data.summary.scanDuration).toBeGreaterThanOrEqual(0);

      results.forEach((resultItem) => {
        if (resultItem.url === validUrl) {
          expect(resultItem.isBroken).toBe(false);
          expect(resultItem.statusCode).toBe(200);
        } else if (resultItem.url === invalidUrl) {
          expect(resultItem.isBroken).toBe(true);
          expect(resultItem.statusCode).toBeUndefined();
          expect(resultItem.error).toBeDefined();
        }
      });
    });

    it("should return 400 for too many URLs (>10)", async () => {
      const manyUrls = new Array(11).fill("https://google.com");
      const res = await request(app)
        .post("/api/check-urls")
        .send({ urls: manyUrls });

      expect(res.status).toBe(400);
    });

    it("should return 400 for empty request", async () => {
      const res = await request(app).post("/api/check-urls").send({ urls: [] });

      expect(res.status).toBe(400);
    });
  });
});
