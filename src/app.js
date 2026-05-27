require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

if (process.env.NODE_ENV === "test") {
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "test-jwt-secret";
  if (!process.env.JWT_SECRET_ADMIN) process.env.JWT_SECRET_ADMIN = "test-jwt-secret-admin";
  if (!process.env.API_KEY) process.env.API_KEY = "test-api-key";
}
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { Key, RateLimiter, AntiScanner } = require("./middlewares");
const morgan = require("morgan");
const Routes = require("./routes/index");
const response = require("./utils/index").ResponseHelper;
const logger = require("./utils/index").logger;
const app = express();

const rootRouter = new Routes();

// cors configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [process.env.FRONTEND_URL || "http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
};

// Middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    skip: () => process.env.NODE_ENV === "test",
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

app.use(cors(corsOptions));
app.use(AntiScanner.blockScanners);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(Key.validateApiKey);
app.set("trust proxy", 1);
app.use(RateLimiter.genRateLimiter);
// Routes
app.use("/api/v1", rootRouter.routes());

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  if (err.message && err.message.startsWith("CORS policy")) {
    return response.error(res, err.message, 403);
  }
  response.serverError(res, err);
});

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
