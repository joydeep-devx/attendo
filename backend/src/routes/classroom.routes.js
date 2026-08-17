const express = require("express");

const {
    createClassroom,
    getClassrooms,
    updateClassroom,
    deleteClassroom,
} = require("../controllers/classroom.controller");

const router = express.Router();

router.post("/", createClassroom);
router.get("/", getClassrooms);
router.patch("/:id", updateClassroom);
router.delete("/:id", deleteClassroom);

module.exports = router;