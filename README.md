# IntelliTask Backend

A Node.js/Express API server with TypeScript, MongoDB, and JWT authentication for task management with AI-powered features.

## 🚀 Features

- **TypeScript** for type safety and better development experience
- **Express.js** RESTful API with proper middleware
- **MongoDB** with Mongoose ODM for data persistence
- **JWT Authentication** with secure token-based sessions
- **bcryptjs** password hashing for user security
- **AI Integration** with OpenAI API and intelligent heuristics fallback
- **CORS** configuration for frontend communication
- **Task CRUD** with ownership validation and history tracking
- **Database Seeding** for development and testing

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/           # Business logic handlers
│   │   ├── auth.controller.ts
│   │   ├── tasks.controller.ts
│   │   └── ai.controller.ts
│   ├── middleware/            # Express middleware
│   │   └── auth.middleware.ts
│   ├── models/                # Mongoose schemas
│   │   ├── User.model.ts
│   │   └── Task.model.ts
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── tasks.routes.ts
│   │   └── ai.routes.ts
│   ├── seed/                  # Database seeding
│   │   └── seed.ts
│   └── server.ts              # Express app setup
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── server.js                # Compiled JavaScript (generated)
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local installation or Atlas account)
- **Git** for version control

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/intellitask
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRES_IN=24h
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Verify server**:
   Visit `http://localhost:3000/health` for health check

### Database Setup

#### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use default URI: `mongodb://localhost:27017/intellitask`

#### Option 2: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Add IP address to whitelist
4. Get connection string and update `MONGO_URI`

### Seed Test Data

```bash
npm run seed
```

Creates test user and sample tasks for development.

## 🔧 API Endpoints

### Authentication Routes

```
POST /api/auth/register
- Register new user
- Body: { username, email, password }

POST /api/auth/login
- User login
- Body: { email, password }

POST /api/auth/logout
- User logout (requires auth)
```

### Task Management Routes (All require JWT auth)

```
GET    /api/tasks           # List user's tasks
GET    /api/tasks/:id       # Get single task
POST   /api/tasks           # Create new task
PUT    /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

### AI Routes

```
POST /api/ai/priority-suggestion
- Get AI priority suggestion
- Body: { title?, description? }
```

### Health Check

```
GET /health                # Server health status
```

## 📊 Data Models

### User Model
```typescript
interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string; // hashed
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Task Model
```typescript
interface ITask {
  _id?: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'to-do' | 'in-progress' | 'completed';
  ownerId: ObjectId;
  history: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

## 🔒 Security Features

- **JWT Authentication**: Bearer token validation
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Task Ownership**: Users can only access their own tasks
- **CORS**: Configured for frontend origins
- **Environment Variables**: Sensitive data in .env files
- **Input Validation**: Request body validation

## 🤖 AI Integration

### OpenAI Priority Suggestions

- **Model**: gpt-3.5-turbo
- **Purpose**: Analyze task title/description for priority
- **Fallback**: Intelligent keyword heuristics if API unavailable

### Heuristics Logic

```typescript
// High priority keywords
const highKeywords = ['urgent', 'asap', 'critical', 'immediately'];

// Medium priority keywords
const mediumKeywords = ['soon', 'important', 'priority'];
```

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test1234!"}'

# Login (get token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Create task (replace TOKEN with actual JWT)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"high"}'
```

### Automated Testing

```bash
# Run tests (if implemented)
npm test
```

## 🚀 Deployment

### Vercel (Recommended for Serverless)

1. Connect GitHub repository to Vercel
2. Vercel will automatically detect `vercel.json` configuration
3. Add environment variables in Vercel dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Strong random key for JWT signing
   - `JWT_EXPIRES_IN` - Token expiration (default: 24h)
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `NODE_ENV` - Set to `production`
4. Deploy automatically on push to master

**Vercel Configuration**: The `vercel.json` file is pre-configured for:
- Node.js serverless functions
- All routes directed to Express server
- 10-second function timeout for API operations

### Alternative Platforms

#### Render
1. Connect GitHub repository
2. Create Web Service
3. Build command: `npm install`
4. Start command: `npm run start:backend`
5. Add environment variables as above

#### Railway/Heroku
- Similar setup to Render
- Use Node.js buildpacks
- Configure environment variables in dashboard

## 📋 Scripts

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "start": "node server.js",
  "build": "tsc",
  "seed": "ts-node-dev src/seed/seed.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## 🔧 Development

### Adding New Endpoints

1. Create controller method in appropriate controller
2. Add route in corresponding routes file
3. Update middleware if authentication required
4. Test with cURL or Postman

### Database Changes

1. Update Mongoose schema in model file
2. Run migration if needed
3. Update controller interfaces
4. Test CRUD operations

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time
- `OPENAI_API_KEY`: OpenAI API key (optional)

## 📊 Monitoring

- Health check endpoint: `GET /health`
- MongoDB connection status
- Request logging (development mode)
- Error handling with proper HTTP status codes

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MONGO_URI in .env
- Verify MongoDB service is running (local) or IP whitelisted (Atlas)
- Test connection with MongoDB Compass

**JWT Token Errors**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Bearer token format in headers

**CORS Errors**
- Check frontend URL in CORS configuration
- Verify environment-specific settings

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Update this README for API changes
4. Test endpoints before committing

## 📄 License

MIT License
