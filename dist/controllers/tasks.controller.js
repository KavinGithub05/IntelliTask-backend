"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTask = exports.listTasks = void 0;
const Task_model_1 = require("../models/Task.model");
const listTasks = async (req, res) => {
    try {
        const ownerId = req.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const tasks = await Task_model_1.Task.find({ ownerId })
            .sort({ priority: -1, dueDate: 1 })
            .lean();
        res.json(tasks);
    }
    catch (err) {
        console.error('List tasks error:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.listTasks = listTasks;
const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.userId;
        const task = await Task_model_1.Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.ownerId.toString() !== ownerId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.json(task);
    }
    catch (err) {
        console.error('Get task error:', err);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};
exports.getTask = getTask;
const createTask = async (req, res) => {
    try {
        const ownerId = req.userId;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { title, description, dueDate, priority, status } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const history = [
            `Task "${title}" created on ${new Date().toLocaleString()}`,
        ];
        const task = await Task_model_1.Task.create({
            title,
            description: description || '',
            dueDate,
            priority: priority || 'medium',
            status: status || 'to-do',
            ownerId,
            history,
        });
        res.status(201).json(task);
    }
    catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.userId;
        const task = await Task_model_1.Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.ownerId.toString() !== ownerId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Track history
        const changes = [];
        for (const key of Object.keys(req.body)) {
            if (key !== '_id' && task[key] !== req.body[key]) {
                changes.push(`${key} changed to ${req.body[key]} on ${new Date().toLocaleString()}`);
            }
        }
        if (changes.length > 0) {
            task.history.push(...changes);
        }
        const updated = await Task_model_1.Task.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    }
    catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.userId;
        const task = await Task_model_1.Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.ownerId.toString() !== ownerId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await Task_model_1.Task.findByIdAndDelete(id);
        res.json({ success: true, message: 'Task deleted' });
    }
    catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=tasks.controller.js.map