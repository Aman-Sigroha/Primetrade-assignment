import crypto from "crypto";

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(email: string, otp: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase()}::${otp}`)
    .digest("hex");
}
