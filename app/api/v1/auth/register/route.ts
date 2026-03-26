import { connectDB } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { User } from "@/models/User";
import { registerSchema } from "@/validators/auth.validator";
import { created, fail, zodError, fromUnknown } from "@/utils/response";
import { MongoServerError } from "mongodb";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return zodError(parsed.error);
    }
    const { name, email, password } = parsed.data;
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString(), user.role);
    return created(
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
      "Registration successful"
    );
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return fail("An account with this email already exists", 409, { code: "DUPLICATE_EMAIL" });
    }
    return fromUnknown(e);
  }
}
