const express = require("express");

const {
    createAttendance,
    getStudentAttendance,
    getSubjectAttendance
} = require("../controllers/attendance.controller");

const router = express.Router();

router.post("/", createAttendance);
router.get("/student/:studentId", getStudentAttendance);
router.get("/subject/:subjectId", getSubjectAttendance);

module.exports = router;