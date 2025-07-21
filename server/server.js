import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import your route files
import authRoutes from '../server/routes/auth.routes.js';
import userRoutes from '../server/routes/user.routes.js';
import adminRoutes from '../server/routes/admin.routes.js';
import healthReportRoutes from '../server/routes/healthReport.routes.js';
import doctorReviewRoutes from '../server/routes/doctorReview.routes.js';

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thinkathon_ai_health')
.then(() => console.log("✅ MongoDB Connected to Thinkathon"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health-reports', healthReportRoutes);
app.use('/api/doctor-review', doctorReviewRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);
