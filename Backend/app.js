import express from 'express';
import morgan from 'morgan';
import connectDB from './database/db.js';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';




// Connect to the database
connectDB();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // Logging middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware to parse cookies

// Define routes
app.use('/users', userRoutes);
app.use('/projects', projectRoutes); // Use project routes
app.use('/ai', aiRoutes); // Use AI routes


app.get('/', (req, res) => {
  res.send('Welcome to the Backend API');
});

export default app;