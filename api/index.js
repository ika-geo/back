/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

//Dependencies Imported :
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");
require("dotenv").config();
const auth = require('../check_authorization/admin_authorization');

//Importing Config File :
var config = require("../config/config.json");
const PORT = process.env.PORT;
//MongoDb Connection :
mongoose.connect(
  config.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  function (err, conn) {
    if (err) {
      console.log("mongodb connection error", err);
    }
    if (!err && conn) {
      console.log("mongodb connection established");
    }
  }
);

//Routes Imported :
var adminRouter = require("../routes/admin");
var clientRouter = require("../routes/client");
var invoiceRouter = require("../routes/invoice");
var timeSheetRouter = require("../routes/timesheet");
var candidateRouter = require("../routes/candidate");
var scheduleRouter = require("../routes/schedule");
var invoiceFilterRouter = require("../routes/invoiceFilter");
var payslipsRouter = require("../routes/payslips");
var usersRouter = require("../routes/users");
var scheduleStatusRouter = require("../routes/scheduleStatus");
//Express Application :
var app = express();

app.use(cors({
    origin: true
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'pug');

//API Routes :

app.use("/admin", adminRouter);
app.use("/client", clientRouter);
app.use("/invoice", invoiceRouter);
app.use("/timesheet", timeSheetRouter);
app.use("/candidate", candidateRouter);
app.use("/invoiceFilter", invoiceFilterRouter.router);
app.use("/payslip", payslipsRouter);
app.use("/schedule", scheduleRouter);
app.use("/users", usersRouter);
// app.use("/", (req, res) => {
//   res.send("Hello world");
// });

// app.use('/scheduleStatus',scheduleStatusRouter);
app.use(express.static(path.resolve(__dirname, "../client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});

module.exports = app;
