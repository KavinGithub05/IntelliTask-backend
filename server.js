const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.resolve(__dirname, "db.json");

app.use(cors());
app.use(express.json());

// JWT configuration (MUST be before authenticateToken function)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

function generateToken(user) {
  const payload = { id: user.id, email: user.email, username: user.username };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Protect task routes with JWT middleware
app.use("/api/tasks", authenticateToken);

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.warn(
      "Failed to read db.json or not found. Returning empty DB.",
      err.message
    );
    return { tasks: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Ensure DB file exists
if (!fs.existsSync(DB_PATH)) {
  // Try to migrate root db.json if exists
  const rootDb = path.resolve(__dirname, "..", "db.json");
  if (fs.existsSync(rootDb)) {
    const rootData = JSON.parse(fs.readFileSync(rootDb, "utf8"));
    // Map legacy tasks to our new structure (title/description/dueDate/status/history)
    const tasks = (rootData.tasks || []).map((t) => ({
      id: Number(t.id) || Date.now(),
      title: t.text || t.title || "Untitled",
      description: t.day || "",
      dueDate: t.dueDate || t.day || null,
      priority: t.priority || "low",
      status: "to-do",
      history: [],
    }));
    writeDB({ tasks });
    console.log("Migrated root db.json into backend db.json");
  } else {
    writeDB({ tasks: [], users: [] });
    console.log("Created new backend db.json");
  }
}

// Get all tasks
app.get("/api/tasks", (req, res) => {
  const db = readDB();
  const userId = req.user?.id;
  if (userId) {
    const userTasks = db.tasks.filter((t) => t.ownerId === userId);
    return res.json(userTasks);
  }
  res.json([]);
});

app.get("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const task = db.tasks.find((t) => String(t.id) === String(id));
  const userId = req.user?.id;
  if (task && userId && task.ownerId !== userId)
    return res.status(403).json({ error: "Forbidden" });
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const db = readDB();
  // Require auth for tasks
  // No auth required for now - we will protect these routes using JWT in middleware if necessary
  const newTask = req.body;
  newTask.id = newTask.id || Date.now();
  newTask.history = newTask.history || [
    `Task "${newTask.title}" created on ${new Date().toLocaleString()}`,
  ];
  // Attach owner
  if (req.user?.id) newTask.ownerId = req.user.id;
  db.tasks.push(newTask);
  writeDB(db);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  const db = readDB();
  const index = db.tasks.findIndex((t) => String(t.id) === String(id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  // Check ownership
  if (req.user?.id && db.tasks[index].ownerId !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  db.tasks[index] = { ...db.tasks[index], ...updated, id: db.tasks[index].id };
  writeDB(db);
  res.json(db.tasks[index]);
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.tasks.findIndex((t) => String(t.id) === String(id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  if (req.user?.id && db.tasks[index].ownerId !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  const deleted = db.tasks.splice(index, 1)[0];
  writeDB(db);
  res.json(deleted);
});

// == AUTH ROUTES ==
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!email || !password || !username)
    return res
      .status(400)
      .json({ error: "username, email and password are required" });
  const db = readDB();
  const existing = (db.users || []).find((u) => u.email === email);
  if (existing) return res.status(409).json({ error: "User already exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), username, email, passwordHash };
  db.users = db.users || [];
  db.users.push(newUser);
  writeDB(db);
  const token = generateToken(newUser);
  res
    .status(201)
    .json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });
  const db = readDB();
  const user = (db.users || []).find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });
  const token = generateToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
});

// Logout (client should remove token; this is a placeholder for potential blacklist/rotate implementations)
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ success: true });
});

// (already registered above)

// == AI ENDPOINT ==
app.post("/api/ai/priority-suggestion", async (req, res) => {
  const { description } = req.body || {};
  if (!description)
    return res.status(400).json({ error: "description is required" });
  // If OPENAI_API_KEY is set, call the OpenAI API; otherwise use a simple heuristic
  const openaiKey = process.env.OPENAI_API_KEY || null;
  if (!openaiKey) {
    // Basic heuristic
    const desc = description.toLowerCase();
    if (/urgent|asap|immediately|high|critical|important/.test(desc))
      return res.json({ priority: "high" });
    if (/soon|this week|medium|normal|priority/.test(desc))
      return res.json({ priority: "medium" });
    return res.json({ priority: "low" });
  }
  try {
    // Use fetch to call OpenAI if available
    const fetch = require("node-fetch");
    const prompt = `Suggest a priority (low|medium|high) for the following task description. Return ONLY the priority word.\n\nDescription: ${description}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5,
      }),
    });
    const data = await response.json();
    let suggestion = "low";
    try {
      suggestion = String(data.choices?.[0]?.message?.content || "")
        .trim()
        .toLowerCase();
      if (!["low", "medium", "high"].includes(suggestion)) suggestion = "low";
    } catch (err) {
      suggestion = "low";
    }
    return res.json({ priority: suggestion });
  } catch (err) {
    console.warn(
      "OpenAI call failed, falling back to simple heuristic",
      err.message
    );
    const desc = description.toLowerCase();
    if (/urgent|asap|immediately|high|critical|important/.test(desc))
      return res.json({ priority: "high" });
    if (/soon|this week|medium|normal|priority/.test(desc))
      return res.json({ priority: "medium" });
    return res.json({ priority: "low" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API server listening on http://localhost:${PORT}`);
});
