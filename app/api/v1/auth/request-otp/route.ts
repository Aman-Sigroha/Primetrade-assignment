import { connectDB } from "@/lib/db";
import { EmailOtp } from "@/models/EmailOtp";
import { User } from "@/models/User";
import { requestOtpSchema } from "@/validators/auth.validator";
import { fail, ok, zodError, fromUnknown } from "@/utils/response";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);
    if (!parsed.success) {
      return zodError(parsed.error);
    }
    const email = parsed.data.email;
    const exists = await User.exists({ email });
    if (exists) {
      return fail("An account with this email already exists", 409, { code: "DUPLICATE_EMAIL" });
    }

    await EmailOtp.deleteMany({ email, consumedAt: null });

    const otp = generateOtpCode();
    const otpHash = hashOtp(email, otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailOtp.create({
      email,
      otpHash,
      expiresAt,
      consumedAt: null,
      attempts: 0,
    });

    const mail = await sendOtpEmail(email, otp);
    const isDev = process.env.NODE_ENV !== "production";

    return ok(
      {
        email,
        expiresInSeconds: 600,
        ...(mail.delivered ? {} : { devOtp: isDev ? otp : undefined }),
      },
      mail.delivered
        ? "OTP sent to your email"
        : isDev
          ? "SMTP not configured; dev OTP returned"
          : "OTP generated"
    );
  } catch (e) {
    return fromUnknown(e);
  }
}
