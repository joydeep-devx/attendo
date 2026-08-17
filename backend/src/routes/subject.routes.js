const express = require("express");

const {
    createSubject,
    getSubjects
} = require("../controllers/subject.controller");

const router = express.Router();

router.post("/", createSubject);
router.get("/", getSubjects);

module.exports = router;