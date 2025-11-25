import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from "./config/db";
import  mainRouter  from './routes/index';

dotenv.config(); // load .env file
connectDB(); // connect to MongoDB




const app = express();
app.use(express.json()); // for parsing JSON data

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', mainRouter);


app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
