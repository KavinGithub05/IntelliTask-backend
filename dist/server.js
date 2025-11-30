"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const tasks_routes_1 = __importDefault(require("./routes/tasks.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || '';
// Middleware
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        // Allow Vercel deployments
        if (origin.includes('vercel.app')) {
            return callback(null, true);
        }
        // Allow same origin (for unified deployment)
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', tasks_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Connect to MongoDB (for serverless)
const connectDB = async () => {
    try {
        if (!MONGO_URI) {
            console.warn('⚠️ MONGO_URI environment variable is not set');
            return;
        }
        // Only connect if not already connected (for serverless reuse)
        if (mongoose_1.default.connection.readyState === 0) {
            await mongoose_1.default.connect(MONGO_URI);
            console.log('✓ Connected to MongoDB');
        }
    }
    catch (err) {
        console.error('✗ MongoDB connection failed:', err.message);
        // Don't exit in serverless environment
    }
};
// For Vercel serverless functions
exports.default = async (req, res) => {
    try {
        // Connect to database if needed
        await connectDB();
        // Handle the request with Express
        return app(req, res);
    }
    catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// For local development
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`✓ Backend server running on http://localhost:${PORT}`);
            console.log(`✓ Health check: http://localhost:${PORT}/health`);
        });
    });
}
//# sourceMappingURL=server.js.map