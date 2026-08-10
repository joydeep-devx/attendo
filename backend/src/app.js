const express = require("express");
const studentRouter = require("./routes/student.routes");
const subjectRouter = require("./routes/subject.routes");
const attendanceRouter = require("./routes/attendance.routes");
const timetableRouter = require("./routes/timetable.routes");
const timeSlotRouter = require("./routes/timeSlot.routes");
const teacherRouter = require("./routes/teacher.routes");
const teacherSubjectRouter = require("./routes/teacherSubject.routes");
const scheduleConfigRouter = require("./routes/scheduleConfig.routes.js");

const app = express();

app.use(express.json());

app.use("/api/students", studentRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/time-slots", timeSlotRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/teacher-subjects", teacherSubjectRouter);
app.use("/api/schedule-config", scheduleConfigRouter);


module.exports = app;