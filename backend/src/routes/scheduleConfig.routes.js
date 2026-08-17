const express = require("express");

const {
    createScheduleConfig,
    getScheduleConfig,
    updateScheduleConfig
} = require("../controllers/scheduleConfig.controller");

const router = express.Router();

router.post("/", createScheduleConfig);
router.get("/", getScheduleConfig);
router.patch("/:id", updateScheduleConfig);


module.exports = router;