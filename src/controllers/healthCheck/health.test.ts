import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/index";

describe("Health Check Endpoint", () => {
  describe("GET /api/health", () => {
    it("should return 200 OK", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
