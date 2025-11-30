"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_model_1 = require("../models/User.model");
const Task_model_1 = require("../models/Task.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const seedDatabase = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || '';
        if (!MONGO_URI) {
            throw new Error('MONGO_URI not set in environment');
        }
        await mongoose_1.default.connect(MONGO_URI);
        console.log('✓ Connected to MongoDB');
        // Clear existing data
        await User_model_1.User.deleteMany({});
        await Task_model_1.Task.deleteMany({});
        console.log('✓ Cleared existing data');
        // Create test user
        const hashedPassword = await bcryptjs_1.default.hash('Password123!', 10);
        const user = await User_model_1.User.create({
            username: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
        });
        console.log('✓ Created test user:', user.email);
        // Create sample tasks
        const tasks = await Task_model_1.Task.create([
            {
                title: 'Finish monthly reporting',
                description: 'Prepare comprehensive monthly report for management review',
                priority: 'high',
                status: 'completed',
                dueDate: new Date(),
                ownerId: user._id,
                history: [
                    `Task created on ${new Date().toLocaleString()}`,
                    `Status changed to completed on ${new Date().toLocaleString()}`,
                ],
            },
            {
                title: 'Contract signing',
                description: 'Review and sign vendor contract',
                priority: 'high',
                status: 'to-do',
                dueDate: new Date(Date.now() + 86400000),
                ownerId: user._id,
                history: [`Task created on ${new Date().toLocaleString()}`],
            },
            {
                title: 'Market overview keynote',
                description: 'Prepare market overview presentation for next week',
                priority: 'medium',
                status: 'to-do',
                dueDate: new Date(Date.now() + 172800000),
                ownerId: user._id,
                history: [`Task created on ${new Date().toLocaleString()}`],
            },
            {
                title: 'Project research',
                description: 'Research competitive products and market trends',
                priority: 'medium',
                status: 'in-progress',
                dueDate: new Date(Date.now() + 172800000),
                ownerId: user._id,
                history: [
                    `Task created on ${new Date().toLocaleString()}`,
                    `Status changed to in-progress on ${new Date().toLocaleString()}`,
                ],
            },
            {
                title: 'Prepare invoices',
                description: 'Generate and send monthly invoices to clients',
                priority: 'low',
                status: 'to-do',
                dueDate: new Date(Date.now() + 259200000),
                ownerId: user._id,
                history: [`Task created on ${new Date().toLocaleString()}`],
            },
            {
                title: 'Update documentation',
                description: 'Update API documentation with new endpoints',
                priority: 'medium',
                status: 'to-do',
                dueDate: new Date(Date.now() + 432000000),
                ownerId: user._id,
                history: [`Task created on ${new Date().toLocaleString()}`],
            },
            {
                title: 'Team meeting setup',
                description: 'Schedule and prepare agenda for next team sync',
                priority: 'low',
                status: 'to-do',
                dueDate: new Date(Date.now() + 604800000),
                ownerId: user._id,
                history: [`Task created on ${new Date().toLocaleString()}`],
            },
        ]);
        console.log(`✓ Created ${tasks.length} sample tasks`);
        console.log('\nSeed data ready!');
        console.log('Test credentials:');
        console.log('  Email: test@example.com');
        console.log('  Password: Password123!');
        process.exit(0);
    }
    catch (err) {
        console.error('✗ Seed failed:', err.message);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map