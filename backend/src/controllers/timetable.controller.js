const Timetable = require("../models/timetable.model");
const Subject = require("../models/subject.model");

const createTimetable = async (req, res) => {
    try {
        const {
            department,
            semester,
            section,
            subject,
            classroom,
            dayOfWeek,
            startTime,
            endTime
        } = req.body;

        // Validate required fields
        if (
            !department ||
            !semester ||
            !section ||
            !subject ||
            !classroom ||
            !dayOfWeek ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message: "All timetable fields are required"
            });
        }

        // Check whether subject exists
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        // Create timetable entry
        const timetable = await Timetable.create({
            department: department.toUpperCase(),
            semester,
            section: section.toUpperCase(),
            subject,
            classroom,
            dayOfWeek,
            startTime,
            endTime
        });

        res.status(201).json({
            success: true,
            message: "Timetable entry created successfully",
            data: timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create timetable entry"
        });
    }
};

const getTimetable = async (req, res) => {
    try {
        const {
            department,
            semester,
            section,
            dayOfWeek
        } = req.query;

        // Build query dynamically
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

        if (dayOfWeek) {
            query.dayOfWeek = dayOfWeek;
        }

        const timetable = await Timetable.find(query)
            .populate("subject", "subjectCode subjectName")
            .sort({
                dayOfWeek: 1,
                startTime: 1
            });

        res.status(200).json({
            success: true,
            count: timetable.length,
            data: timetable
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch timetable"
        });
    }
};

module.exports = {
    createTimetable,
    getTimetable
};