const express = require("express");

const {
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deleteTimeSlot
} = require("../controllers/timeSlot.controller");

const router = express.Router();

router.post("/", createTimeSlot);
router.get("/", getTimeSlots);
router.patch("/:id", updateTimeSlot);
router.delete("/:id",deleteTimeSlot);

module.exports = router;