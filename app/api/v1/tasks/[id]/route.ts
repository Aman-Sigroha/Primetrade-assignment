import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { updateTaskSchema } from "@/validators/task.validator";
import { requireAuth, handleRouteError, AuthError } from "@/lib/api-auth";
import { ok, fail, zodError, fromUnknown } from "@/utils/response";
import mongoose from "mongoose";
import { serializeTask, type TaskLean } from "@/lib/serialize-task";

type Ctx = { params: { id: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    await connectDB();
    const auth = requireAuth(_request);
    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid task id", 400, { code: "INVALID_ID" });
    }
    const task = await Task.findById(id).lean();
    if (!task) {
      return fail("Task not found", 404, { code: "NOT_FOUND" });
    }
    if (auth.role !== "admin" && task.userId.toString() !== auth.userId) {
      return fail("Forbidden", 403, { code: "FORBIDDEN" });
    }
    return ok({ task: serializeTask(task) });
  } catch (e) {
    if (e instanceof AuthError) {
      return handleRouteError(e);
    }
    return fromUnknown(e);
  }
}

export async function PUT(request: Request, context: Ctx) {
  try {
    await connectDB();
    const auth = requireAuth(request);
    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid task id", 400, { code: "INVALID_ID" });
    }
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return zodError(parsed.error);
    }
    const task = await Task.findById(id);
    if (!task) {
      return fail("Task not found", 404, { code: "NOT_FOUND" });
    }
    if (auth.role !== "admin" && task.userId.toString() !== auth.userId) {
      return fail("Forbidden", 403, { code: "FORBIDDEN" });
    }
    if (parsed.data.title !== undefined) {
      task.title = parsed.data.title;
    }
    if (parsed.data.description !== undefined) {
      task.description = parsed.data.description;
    }
    await task.save();
    return ok({ task: serializeTask(task.toObject() as TaskLean) }, "Task updated");
  } catch (e) {
    if (e instanceof AuthError) {
      return handleRouteError(e);
    }
    return fromUnknown(e);
  }
}

export async function DELETE(request: Request, context: Ctx) {
  try {
    await connectDB();
    const auth = requireAuth(request);
    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid task id", 400, { code: "INVALID_ID" });
    }
    const task = await Task.findById(id);
    if (!task) {
      return fail("Task not found", 404, { code: "NOT_FOUND" });
    }
    if (auth.role !== "admin" && task.userId.toString() !== auth.userId) {
      return fail("Forbidden", 403, { code: "FORBIDDEN" });
    }
    await task.deleteOne();
    return ok({ id }, "Task deleted");
  } catch (e) {
    if (e instanceof AuthError) {
      return handleRouteError(e);
    }
    return fromUnknown(e);
  }
}
