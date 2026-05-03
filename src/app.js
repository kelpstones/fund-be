require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Key } = require("./middlewares");
const morgan = require("morgan");
const Routes = require("./routes/index");
const response = require("./utils/index").ResponseHelper;
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
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(Key.validateApiKey);

// Routes
app.use("/api/v1", rootRouter.routes());

app.use((err, req, res, next) => {
  response.serverError(res, err);
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
