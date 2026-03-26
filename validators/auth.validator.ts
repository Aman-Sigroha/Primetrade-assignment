import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(1, "Name is required")
      .max(120),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email")
      .max(254),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(128),
    verificationToken: z.string({ required_error: "verificationToken is required" }).min(10),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email"),
    password: z.string({ required_error: "Password is required" }).min(1),
  })
  .strict();

export const requestOtpSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email"),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email"),
    otp: z
      .string({ required_error: "OTP is required" })
      .trim()
      .regex(/^\d{6}$/, "OTP must be 6 digits"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
