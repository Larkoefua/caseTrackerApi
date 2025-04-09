import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import caseRouter from "./routes/case.js";
import userRouter from './routes/user.js';
import documentRouter from './routes/document.js';
import updateRouter from './routes/update.js';
import { notFound, errorHandler } from './middleware/err.js';
// create express app
const caseTrackerApp = express();

// connect to the database
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1);
}

// define middlewares
caseTrackerApp.use(cors());
caseTrackerApp.use(express.json());
caseTrackerApp.use(express.urlencoded({ extended: true }));

// define routes
caseTrackerApp.use('/api/cases', caseRouter);
caseTrackerApp.use('/api/users', userRouter);
caseTrackerApp.use('/api/documents', documentRouter);
caseTrackerApp.use('/api/updates', updateRouter);

// Error handling middleware should be after routes
caseTrackerApp.use(notFound);
caseTrackerApp.use(errorHandler);

// app.get('/', (req, res) => {
//     res.send('API is running...');
//   });
// listen for incoming requests
caseTrackerApp.listen(3009, () =>{
    console.log('App is listening on port 3009')
});