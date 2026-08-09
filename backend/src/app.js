const express = require("express");
const studentRouter = require("./routes/student.routes");
const subjectRouter = require("./routes/subject.routes");
const attendanceRouter = require("./routes/attendance.routes");
const timetableRouter = require("./routes/timetable.routes");

const app = express();

app.use(express.json());

app.use("/api/students", studentRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/timetable", timetableRouter);

module.exports = app;