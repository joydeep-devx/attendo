const express = require("express");

const {
    createTimetable,
    getTimetable
} = require("../controllers/timetable.controller");

const router = express.Router();

router.post("/", createTimetable);
router.get("/", getTimetable);

module.exports = router;