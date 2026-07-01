require ("dotenv").config();
const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const router = require("./Routes/authRoute");
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const uploadDir = path.join(__dirname, "uplads/cvs");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

async function dbconnection() {
  
try {
  await mongoose.connect(process.env.DB_URL)
  console.log("DB Connected");
  
} catch (error) {
  console.log(error);
}

}
dbconnection();

const authRoutes = require("./Routes/authRoute");
const userRoutes = require("./Routes/userRoute");
const candidateRoute = require("./Routes/candidateRoute");
const companyRoute = require("./Routes/companyRoute");
const jobRoutes = require("./Routes/jobRoute");
const applicationRoutes = require("./Routes/applicationRoute");

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/candidates', candidateRoute);
app.use('/api/companies',companyRoute);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);



app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));

