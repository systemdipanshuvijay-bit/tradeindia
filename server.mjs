import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the same directory as server.mjs
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug environment variables
console.log('Environment variables:', {
  USER_ID: process.env.USER_ID,
  PROFILE_ID: process.env.PROFILE_ID,
  KEY: process.env.KEY,
  PORT: process.env.PORT
});

const app = express();
app.use(cors());
app.use(express.json());

// Validate required environment variables
const USER_ID = process.env.USER_ID;
const PROFILE_ID = process.env.PROFILE_ID;
const KEY = process.env.KEY;

if (!USER_ID || !PROFILE_ID || !KEY) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Rate limiting setup
const rateLimit = {};
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

// ✅ API route to fetch TradeIndia leads
app.get("/fetch-tradeindia", async (req, res) => {
  try {
    // Rate limiting check
    const ip = req.ip;
    const now = Date.now();
    if (!rateLimit[ip]) {
      rateLimit[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }
    
    if (now > rateLimit[ip].resetTime) {
      rateLimit[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }
    
    rateLimit[ip].count++;
    if (rateLimit[ip].count > MAX_REQUESTS) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    // Input validation with default to today's date
    let { from_date, to_date, limit = 100, page_no = 1 } = req.query;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // If dates are not provided, use today's date
    from_date = from_date || today;
    to_date = to_date || today;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page_no);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: "limit must be a number between 1 and 100" });
    }
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: "page_no must be a positive number" });
    }

    const url = `https://www.tradeindia.com/utils/my_inquiry.html?userid=${USER_ID}&profile_id=${PROFILE_ID}&key=${KEY}&from_date=${from_date}&to_date=${to_date}&limit=${limitNum}&page_no=${pageNum}`;

    // Browser-like headers to avoid CloudFront blocking
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.9",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://www.tradeindia.com/",
      "Origin": "https://www.tradeindia.com"
    };

    const response = await axios.get(url, { headers });
    res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Error fetching TradeIndia data:", err.message);
    res.status(500).json({ error: "Failed to fetch TradeIndia data", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy server running on port ${PORT}`));
