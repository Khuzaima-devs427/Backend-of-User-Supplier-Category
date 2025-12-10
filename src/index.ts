import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from "./config/db";
import mainRouter from './routes/index';
import authRoutes from './routes/authRoutes'
dotenv.config();
connectDB();


const app = express();

// app.use(cors({
//   origin: [
//     'https://user-supplier-category-kp5r.vercel.app',
//     'https://user-supplier-category-t5wz.vercel.app',
//     'https://user-supplier-category-t61i.vercel.app', 
//     'http://localhost:3000', // for local development
//   ],
//   credentials: true
// }));


app.use(cors({
  origin: function (origin, callback) {
    // Allow no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Only allow YOUR specific Vercel project URLs
    // Pattern: https://user-supplier-category-XXXXX.vercel.app
    const yourProjectPattern = /^https:\/\/user-supplier-category-[a-z0-9]+\.vercel\.app$/;
    
    if (yourProjectPattern.test(origin)) {
      console.log(`✅ Allowed: ${origin}`);
      return callback(null, true);
    }
    
    // Block everything else
    console.log(`❌ Blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
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





