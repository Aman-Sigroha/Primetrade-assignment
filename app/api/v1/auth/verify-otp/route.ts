import { connectDB } from "@/lib/db";
import { EmailOtp } from "@/models/EmailOtp";
import { verifyOtpSchema } from "@/validators/auth.validator";
import { fail, ok, zodError, fromUnknown } from "@/utils/response";
import { hashOtp } from "@/lib/otp";
import { generateEmailVerificationToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return zodError(parsed.error);
    }
    const { email, otp } = parsed.data;
    const rec = await EmailOtp.findOne({ email, consumedAt: null }).sort({ createdAt: -1 });
    if (!rec) {
      return fail("No OTP request found for this email", 404, { code: "OTP_NOT_FOUND" });
    }
    if (rec.expiresAt.getTime() < Date.now()) {
      return fail("OTP has expired", 400, { code: "OTP_EXPIRED" });
    }
    if (rec.attempts >= 5) {
      return fail("Too many invalid attempts", 429, { code: "OTP_LOCKED" });
    }
    const incomingHash = hashOtp(email, otp);
    if (incomingHash !== rec.otpHash) {
      rec.attempts += 1;
      await rec.save();
      return fail("Invalid OTP", 400, { code: "OTP_INVALID" });
    }
    rec.consumedAt = new Date();
    await rec.save();
    const verificationToken = generateEmailVerificationToken(email);
    return ok({ verificationToken, email }, "Email verified successfully");
  } catch (e) {
    return fromUnknown(e);
  }
}
