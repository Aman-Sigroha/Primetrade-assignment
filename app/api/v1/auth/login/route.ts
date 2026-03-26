import { connectDB } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { User } from "@/models/User";
import { loginSchema } from "@/validators/auth.validator";
import { ok, fail, zodError, fromUnknown } from "@/utils/response";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return zodError(parsed.error);
    }
    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+password");
    const valid = user ? await user.comparePassword(password) : false;
    if (!user || !valid) {
      return fail("Invalid email or password", 401, { code: "INVALID_CREDENTIALS" });
    }
    const token = generateToken(user._id.toString(), user.role);
    return ok(
      {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      "Signed in successfully"
    );
  } catch (e) {
    return fromUnknown(e);
  }
}
