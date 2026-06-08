import bodyParser from "body-parser";
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/routes/routes";

dotenv.config();

const app: Application = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://sedulur-tani-fe.vercel.app",
  "https://sedulurtani.com",
  "https://www.sedulurtani.com",
  "http://127.0.0.1:3000",
  "http://192.168.1.8:3000",
  process.env.FRONTEND_URL || "http://localhost:3000",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // Allow all origins in development
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "api-key",
  ],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(
    `📨 ${req.method} ${req.path} - Origin: ${
      req.headers.origin || "no-origin"
    }`,
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/v1", router);

const PORT = process.env.PORT || 8686;

// For Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Frontend: http://localhost:3000`);
    console.log(` CORS enabled for frontend`);
  });
}
