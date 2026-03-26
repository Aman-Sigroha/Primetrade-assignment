import type mongoose from "mongoose";

export type TaskLean = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export function serializeTask(doc: TaskLean) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? "",
    userId: doc.userId.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
