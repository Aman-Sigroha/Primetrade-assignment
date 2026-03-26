import { describe, expect, it, beforeAll } from "vitest";
import { generateToken, verifyToken } from "@/lib/auth";

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min!!";
});

describe("JWT helpers", () => {
  it("round-trips userId and role with issuer/audience checks", () => {
    const token = generateToken("507f1f77bcf86cd799439011", "user");
    const payload = verifyToken(token);
    expect(payload.userId).toBe("507f1f77bcf86cd799439011");
    expect(payload.role).toBe("user");
  });

  it("supports admin role", () => {
    const token = generateToken("507f1f77bcf86cd799439012", "admin");
    expect(verifyToken(token).role).toBe("admin");
  });

  it("rejects tampered tokens", () => {
    const token = generateToken("507f1f77bcf86cd799439011", "user");
    const bad = token.slice(0, -4) + "xxxx";
    expect(() => verifyToken(bad)).toThrow();
  });
});
