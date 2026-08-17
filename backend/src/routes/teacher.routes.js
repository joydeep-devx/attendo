const express = require("express");

const {
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher,
} = require("../controllers/teacher.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();

router.post("/", authenticate, authorize("ADMIN"), createTeacher);
router.get("/", authenticate, authorize("ADMIN", "TEACHER"), getTeachers);
router.patch("/:id", authenticate, authorize("ADMIN"),updateTeacher);
router.delete("/:id", authenticate, authorize("ADMIN"),deleteTeacher);

module.exports = router;
