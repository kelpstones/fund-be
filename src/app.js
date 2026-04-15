const express = require("express");
const cors = require("cors");
const { Key } = require("./middlewares");
const morgan = require('morgan');
require("dotenv").config();
const Routes = require('./routes/index');
const app = express();

const rootRouter = new Routes();
// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(Key.validateApiKey);


// Routes
app.use('/api/v1', rootRouter.routes());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
