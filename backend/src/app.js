const express = require("express");
const studentRouter = require("./routes/student.routes");

const app = express();

app.use(express.json());

app.use("/api/students", studentRouter);

module.exports = app;