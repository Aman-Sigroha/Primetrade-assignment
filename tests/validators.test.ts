import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/validators/auth.validator";
import { createTaskSchema, updateTaskSchema } from "@/validators/task.validator";

describe("auth validators", () => {
  it("accepts valid registration input and normalizes email", () => {
    const parsed = registerSchema.safeParse({
      name: "  Jane  ",
      email: " Jane@Example.COM ",
      password: "password123",
      verificationToken: "verification-token-example",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Jane");
      expect(parsed.data.email).toBe("jane@example.com");
    }
  });

  it("rejects short password", () => {
    const parsed = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "short",
      verificationToken: "verification-token-example",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unknown keys (strict)", () => {
    const parsed = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      verificationToken: "verification-token-example",
      extra: "nope",
    } as unknown);
    expect(parsed.success).toBe(false);
  });

  it("accepts login payload", () => {
    const parsed = loginSchema.safeParse({
      email: "User@Example.com",
      password: "anything",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("user@example.com");
    }
  });
});

describe("task validators", () => {
  it("requires title on create", () => {
    const parsed = createTaskSchema.safeParse({ description: "only desc" } as unknown);
    expect(parsed.success).toBe(false);
  });

  it("allows optional description", () => {
    const parsed = createTaskSchema.safeParse({ title: "  Ship feature  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe("Ship feature");
      expect(parsed.data.description).toBeUndefined();
    }
  });

  it("update rejects empty patch", () => {
    const parsed = updateTaskSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it("update accepts partial fields", () => {
    const parsed = updateTaskSchema.safeParse({ title: "Next" });
    expect(parsed.success).toBe(true);
  });
});
