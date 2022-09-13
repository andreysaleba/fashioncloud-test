const createError = require("http-errors");
const express = require("express");
require('express-async-errors');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const logger = require("morgan");

const cacheRouter = require("./routes/cache");
const { isDevelopmentEnvironment } = require("./utils/environment");

dotenv.config();
const app = express();

async function initApp () {
  if (isDevelopmentEnvironment()) {
    app.use(logger("dev"));
  } else {
    app.use(logger("tiny"));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  await mongoose.connect(process.env.MONGODB_URL_STRING);
  app.use("/cache", cacheRouter);

// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

// error handler
  app.use(function (err, req, res) {
    // render the error page
    res.status(err.status || 500);
    res.send("error");
  });
}

initApp();

module.exports = app;
