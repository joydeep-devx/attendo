const express = require("express");
const { createStudent , registerFace ,  getStudents ,getStudent , updateStudent , deleteStudent} = require("../controllers/student.controller");

const router = express.Router();





router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.patch("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/:id/face", registerFace);

module.exports = router;