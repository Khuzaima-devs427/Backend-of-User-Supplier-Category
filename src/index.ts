import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from "./config/db";
import mainRouter from './routes/index';

dotenv.config();
connectDB();


const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api', mainRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





