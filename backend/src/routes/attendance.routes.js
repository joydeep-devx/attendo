const express = require("express");

const {
    createAttendance,
    getStudentAttendance,
    getSubjectAttendance,
    getAttendanceSummary
} = require("../controllers/attendance.controller");

const router = express.Router();

router.post("/", createAttendance);
router.get("/student/:studentId", getStudentAttendance);
router.get("/subject/:subjectId", getSubjectAttendance);
router.get("/summary/subject/:subjectId",getAttendanceSummary);

module.exports = router;