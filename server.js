
// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import adminRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Allowed Origins (Frontend URLs)
const allowedOrigins = [
    "http://localhost:5173",
    "http://192.168.1.2:5173",
    "http://192.168.1.4:5173",
    "http://192.168.1.7:5173",
    "http://192.168.1.5:5173",
    "https://techpixo.com",
    "https://techpixo.com/admin",
    "https://techpixo.onrender.com",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.some((url) => origin.startsWith(url))) {
                return callback(null, true);
            }
            console.warn("🚫 Blocked by CORS:", origin);
            callback(new Error("CORS policy: Not allowed by server"));
        },
        credentials: true, // ✅ Needed for cookies
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ Routes
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);

// ================= HEALTH & TEST =================
app.get("/healthy", (req, res) => {
    console.log("💓 Health check ping at:", new Date().toISOString());
    res.status(200).send("OK");
});

// ✅ Root Route (Test)
app.get("/", (req, res) => {
    res.send("MongoDB connection test successful 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));

