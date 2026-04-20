import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "@/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
