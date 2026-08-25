require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

//  uplads إلى uploads
const uploadDir = path.join(__dirname, "uploads/cvs");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// helmet's default cross-origin-resource-policy is 'same-origin', which would
// stop the frontend from loading uploaded CVs served from this origin; relax it
// to cross-origin while keeping the rest of helmet's headers.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());
app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:8080'], credentials: true }));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));

// Throttle credential endpoints against brute force / enumeration. Disabled
// under NODE_ENV=test so the verification suite doesn't rate-limit itself.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // TODO: revert back to 10
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { msg: 'Too many attempts. Please try again later.' }
});

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        service: 'hirehub-backend',
        database: databaseConnected ? 'connected' : 'disconnected'
    });
});

async function dbconnection() {

    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("DB Connected");
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }

}
const authRoutes = require("./Routes/authRoute");
const userRoutes = require("./Routes/userRoute");
const adminRoutes = require("./Routes/adminRoute");
const candidateRoute = require("./Routes/candidateRoute");
const companyRoute = require("./Routes/companyRoute");
const jobRoutes = require("./Routes/jobRoute");
const applicationRoutes = require("./Routes/applicationRoute");
const notificationRoutes = require('./Routes/notificationRoute');
const chatRoutes = require('./Routes/chatRoute');
const interviewRoutes = require('./Routes/interviewRoute');
const assessmentRoutes = require('./Routes/assessmentRoutes');
app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidateRoute);
app.use('/api/companies', companyRoute);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api', assessmentRoutes);
// Global error handler: last line of defence for anything a controller's
// try/catch missed. Logs the real error server-side and returns a generic
// message in production so internal details don't leak to clients.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        msg: isProduction ? 'Something went wrong' : err.message
    });
});



const server = require('http').createServer(app);
require('./socket').init(server);
dbconnection().then((connected) => {
    if (!connected) return;
    const { startApplicationAiWorker } = require('./services/applicationAiWorker');
    const { startAssessmentPoller } = require('./services/assessmentPoller');
    startApplicationAiWorker();
    startAssessmentPoller();
});
server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
