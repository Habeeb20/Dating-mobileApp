import express from 'express';
import authRoutes from './routes/userRoutes.js';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import datingRouter from './routes/datingRoute.js';
import setupSocket from './config/socketioSetup.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();


const httpServer = http.createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 

// Routes
app.get('/', (req, res) => {
  res.send('App is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/dating', datingRouter);

// Setup Socket.IO
setupSocket(io);

// Start server after connecting to the database
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});