const express = require("express");

const {
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher
} = require("../controllers/teacher.controller");

const router = express.Router();

router.post("/", createTeacher);
router.get("/", getTeachers);
router.patch("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

module.exports = router;