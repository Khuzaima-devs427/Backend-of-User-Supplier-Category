import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from "./config/db";
import mainRouter from './routes/index';
import authRoutes from './routes/authRoutes'
dotenv.config();
connectDB();


const app = express();

app.use(cors({
  origin: [
    'https://user-supplier-category-t5wz.vercel.app',
    'http://localhost:3000', // for local development
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api', mainRouter);
app.use('/api', authRoutes)

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





