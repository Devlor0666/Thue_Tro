require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const app = express();
const cors = require("cors");

const allowedOrigins = new Set([
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin không được phép"));
    },
    credentials: true,
  }),
);
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    );
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.get("/health", async (req, res, next) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(new AppError("Không thể kết nối cơ sở dữ liệu", 503));
  }
});

app.use("/users", require("./routes/userRoutes"));
app.use("/rooms", require("./routes/roomRoutes"));
app.use("/listings", require("./routes/listingRoutes"));
app.use("/favorites", require("./routes/favoriteRoutes"));
app.use("/reports", require("./routes/reportRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));
app.use("/messages", require("./routes/messageRoutes"));
app.use("/contracts", require("./routes/contractRoutes"));
app.use("/invoices", require("./routes/invoiceRoutes"));
app.use("/transactions", require("./routes/transactionRoutes"));

app.use((req, res, next) =>
  next(
    new AppError(`Không tìm thấy API: ${req.method} ${req.originalUrl}`, 404),
  ),
);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`API đang chạy tại http://localhost:${PORT}`),
  );
}
module.exports = app;
