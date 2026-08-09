const express = require("express");

const {
    createAttendance
} = require("../controllers/attendance.controller");

const router = express.Router();

router.post("/", createAttendance);

module.exports = router;