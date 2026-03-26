import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { createTaskSchema } from "@/validators/task.validator";
import { requireAuth, handleRouteError, AuthError } from "@/lib/api-auth";
import { created, ok, fail, zodError, fromUnknown } from "@/utils/response";
import mongoose from "mongoose";
import { serializeTask, type TaskLean } from "@/lib/serialize-task";

export async function GET(request: Request) {
  try {
    await connectDB();
    const auth = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get("userId");

    if (auth.role === "admin") {
      const filter =
        filterUserId && mongoose.Types.ObjectId.isValid(filterUserId)
          ? { userId: new mongoose.Types.ObjectId(filterUserId) }
          : {};
      const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
      return ok({ tasks: tasks.map((t) => serializeTask(t)) });
    }

    if (filterUserId && filterUserId !== auth.userId) {
      return fail("Forbidden", 403, { code: "FORBIDDEN" });
    }

    const tasks = await Task.find({ userId: auth.userId }).sort({ createdAt: -1 }).lean();
    return ok({ tasks: tasks.map((t) => serializeTask(t)) });
  } catch (e) {
    if (e instanceof AuthError) {
      return handleRouteError(e);
    }
    return fromUnknown(e);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const auth = requireAuth(request);
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return zodError(parsed.error);
    }
    const task = await Task.create({
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      userId: auth.userId,
    });
    return created(serializeTask(task.toObject() as TaskLean));
  } catch (e) {
    if (e instanceof AuthError) {
      return handleRouteError(e);
    }
    return fromUnknown(e);
  }
}
