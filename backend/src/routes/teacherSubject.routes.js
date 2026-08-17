const express = require("express");

const {
    assignTeacherToSubject,
    getTeachersBySubject,
    getSubjectsByTeacher
} = require("../controllers/teacherSubject.controller");

const router = express.Router();

router.post("/", assignTeacherToSubject);
router.get("/subject/:subjectId", getTeachersBySubject);
router.get("/teacher/:teacherId",getSubjectsByTeacher);

module.exports = router;