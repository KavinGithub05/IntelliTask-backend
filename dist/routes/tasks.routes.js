"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tasks_controller_1 = require("../controllers/tasks.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// All task routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/', tasks_controller_1.listTasks);
router.get('/:id', tasks_controller_1.getTask);
router.post('/', tasks_controller_1.createTask);
router.put('/:id', tasks_controller_1.updateTask);
router.delete('/:id', tasks_controller_1.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map