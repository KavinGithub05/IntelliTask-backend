import { Schema, model, Document, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'to-do' | 'in-progress' | 'completed';

export interface ITask extends Document {
  title: string;
  description: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  ownerId: Types.ObjectId;
  history: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['to-do', 'in-progress', 'completed'],
      default: 'to-do',
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    history: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Index for faster queries by ownerId
TaskSchema.index({ ownerId: 1 });
TaskSchema.index({ dueDate: 1 });

export const Task = model<ITask>('Task', TaskSchema);
