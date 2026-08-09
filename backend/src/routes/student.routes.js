const express = require("express");
const { createStudent , registerFace } = require("../controllers/student.controller");

const router = express.Router();

router.post("/", createStudent);
router.post("/:id/face", registerFace);

module.exports = router;