const ScheduleConfig = require("../models/scheduleConfig.model");
const {
    validateScheduleConfig,
} = require("../services/scheduleConfig.service");

const createScheduleConfig = async (req, res) => {
    try {
        const {
            department,
            semester,
            section,
            workingDays,
            timeSlots,
            breaks,
        } = req.body;

        // Validate required fields
        if (
            !department ||
            !semester ||
            !section ||
            !workingDays ||
            !timeSlots
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Department, semester, section, working days and time slots are required",
            });
        }

        const validation = validateScheduleConfig({
            workingDays,
            timeSlots,
            breaks: breaks || [],
        });

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        // Check whether configuration already exists
        const existingConfig = await ScheduleConfig.findOne({
            department: department.toUpperCase(),
            semester,
            section: section.toUpperCase(),
        });

        if (existingConfig) {
            return res.status(409).json({
                success: false,
                message:
                    "Schedule configuration already exists for this department, semester and section",
            });
        }

        // Create schedule configuration
        const scheduleConfig = await ScheduleConfig.create({
            department: department.toUpperCase(),
            semester,
            section: section.toUpperCase(),
            workingDays,
            timeSlots,
            breaks: breaks || [],
        });

        res.status(201).json({
            success: true,
            message: "Schedule configuration created successfully",
            data: scheduleConfig,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create schedule configuration",
        });
    }
};

const getScheduleConfig = async (req, res) => {
    try {
        const { department, semester, section } = req.query;

        const query = {};

        if (department) {
            query.department = department.toUpperCase();
        }

        if (semester) {
            query.semester = Number(semester);
        }

        if (section) {
            query.section = section.toUpperCase();
        }

        const scheduleConfigs = await ScheduleConfig.find(query);

        res.status(200).json({
            success: true,
            count: scheduleConfigs.length,
            data: scheduleConfigs,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch schedule configuration",
        });
    }
};

const updateScheduleConfig = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            department,
            semester,
            section,
            workingDays,
            timeSlots,
            breaks,
        } = req.body;

        // Find existing configuration
        const existingConfig = await ScheduleConfig.findById(id);

        if (!existingConfig) {
            return res.status(404).json({
                success: false,
                message: "Schedule configuration not found",
            });
        }

        // Values to update
        const updatedDepartment =
            department !== undefined
                ? department.toUpperCase()
                : existingConfig.department;

        const updatedSemester =
            semester !== undefined ? semester : existingConfig.semester;

        const updatedSection =
            section !== undefined
                ? section.toUpperCase()
                : existingConfig.section;

        const updatedWorkingDays =
            workingDays !== undefined
                ? workingDays
                : existingConfig.workingDays;

        const updatedTimeSlots =
            timeSlots !== undefined ? timeSlots : existingConfig.timeSlots;

        const updatedBreaks =
            breaks !== undefined ? breaks : existingConfig.breaks;

        const validation = validateScheduleConfig({
            workingDays: updatedWorkingDays,
            timeSlots: updatedTimeSlots,
            breaks: updatedBreaks,
        });

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        // Check whether another configuration
        // already uses the same department, semester and section
        const duplicateConfig = await ScheduleConfig.findOne({
            _id: { $ne: id },
            department: updatedDepartment,
            semester: updatedSemester,
            section: updatedSection,
        });

        if (duplicateConfig) {
            return res.status(409).json({
                success: false,
                message:
                    "Another schedule configuration already exists for this department, semester and section",
            });
        }

        // Update configuration
        existingConfig.department = updatedDepartment;
        existingConfig.semester = updatedSemester;
        existingConfig.section = updatedSection;
        existingConfig.workingDays = updatedWorkingDays;
        existingConfig.timeSlots = updatedTimeSlots;
        existingConfig.breaks = updatedBreaks;

        const updatedConfig = await existingConfig.save();

        res.status(200).json({
            success: true,
            message: "Schedule configuration updated successfully",
            data: updatedConfig,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update schedule configuration",
        });
    }
};

module.exports = {
    createScheduleConfig,
    getScheduleConfig,
    updateScheduleConfig,
};
