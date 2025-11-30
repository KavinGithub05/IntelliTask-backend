"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
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
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    history: { type: [String], default: [] },
}, { timestamps: true });
// Index for faster queries by ownerId
TaskSchema.index({ ownerId: 1 });
TaskSchema.index({ dueDate: 1 });
exports.Task = (0, mongoose_1.model)('Task', TaskSchema);
//# sourceMappingURL=Task.model.js.map