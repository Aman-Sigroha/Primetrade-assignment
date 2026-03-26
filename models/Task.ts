import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200, index: true },
    description: { type: String, default: "", maxlength: 5000 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, createdAt: -1 });

export type TaskDoc = InferSchemaType<typeof taskSchema> & { _id: mongoose.Types.ObjectId };

export type TaskModel = Model<TaskDoc>;

export const Task =
  (mongoose.models.Task as TaskModel) ?? mongoose.model<TaskDoc>("Task", taskSchema);
