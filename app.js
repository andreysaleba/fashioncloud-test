const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const dotenv = require("dotenv");

const cacheRouter = require("./routes/cache");
const mongoose = require("mongoose");

dotenv.config();
const app = express();

async function initApp () {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  await mongoose.connect(process.env.MONGODB_URL_STRING);
  app.use("/cache", cacheRouter);

// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

// error handler
  app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500);
    res.send("error");
  });
}

initApp();

module.exports = app;
