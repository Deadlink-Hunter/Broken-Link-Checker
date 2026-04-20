import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { checkUrl } from "@urlService";
import { SOFT_404_DETECTED } from "@constant";
import { server } from "@/mocks/server";

const MOCK_URL = "https://mock-soft-404.com";

describe("soft 404 detection", () => {
  it("should return isBroken: true when title contains '404'", async () => {
    server.use(
      http.get(MOCK_URL, () =>
        HttpResponse.html(
          "<html><head><title>404 Not Found</title></head><body>oops</body></html>",
          { status: 200 },
        ),
      ),
    );

    const result = await checkUrl(MOCK_URL);

    expect(result.isBroken).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBe(SOFT_404_DETECTED);
  });

  it("should return isBroken: true when title contains 'not found'", async () => {
    server.use(
      http.get(MOCK_URL, () =>
        HttpResponse.html(
          "<html><head><title>Page Not Found</title></head><body>oops</body></html>",
          { status: 200 },
        ),
      ),
    );

    const result = await checkUrl(MOCK_URL);

    expect(result.isBroken).toBe(true);
    expect(result.error).toBe(SOFT_404_DETECTED);
  });

  it("should return isBroken: false when title is normal", async () => {
    server.use(
      http.get(MOCK_URL, () =>
        HttpResponse.html(
          "<html><head><title>Welcome to our site</title></head><body>hello</body></html>",
          { status: 200 },
        ),
      ),
    );

    const result = await checkUrl(MOCK_URL);

    expect(result.isBroken).toBe(false);
    expect(result.statusCode).toBe(200);
  });

  it("should return isBroken: false when response is JSON (non-HTML)", async () => {
    server.use(
      http.get(MOCK_URL, () =>
        HttpResponse.json({ message: "not found", code: 404 }, { status: 200 }),
      ),
    );

    const result = await checkUrl(MOCK_URL);

    expect(result.isBroken).toBe(false);
    expect(result.statusCode).toBe(200);
  });

  it("should return isBroken: false when body is empty", async () => {
    server.use(
      http.get(
        MOCK_URL,
        () =>
          new HttpResponse("", {
            status: 200,
            headers: { "Content-Type": "text/html" },
          }),
      ),
    );

    const result = await checkUrl(MOCK_URL);

    expect(result.isBroken).toBe(false);
    expect(result.statusCode).toBe(200);
  });
});
