const express = require("express");
const cors = require("cors");
const validateApiKey = require("./middlewares/key");
const morgan = require('morgan');
require("dotenv").config();
const rootRouter = require('./routes/index');
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(validateApiKey);


// Routes
app.use('/api/v1', rootRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
