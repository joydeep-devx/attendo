const Timetable = require("../models/timetable.model");
const Subject = require("../models/subject.model");
const Teacher = require("../models/teacher.model");
const TeacherSubject = require("../models/teacherSubject.model");
const TimeSlot = require("../models/timeSlot.model");
const Classroom = require("../models/classroom.model");

const { checkTimetableConflict } = require("../services/timetable.service");

const createTimetable = async (req, res) => {
    try {
        const {
            department,
            semester,
            section,
            subject,
            teacher,
            classroom,
            dayOfWeek,
            timeSlot
        } = req.body;

        // Validate required fields
        if (
            !department ||
            !semester ||
            !section ||
            !subject ||
            !teacher ||
            !classroom ||
            !dayOfWeek ||
            !timeSlot
        ) {
            return res.status(400).json({
                success: false,
                message: "All timetable fields are required",
            });
        }

        // Check whether subject exists
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        // Check whether teacher exists
        const existingTeacher = await Teacher.findById(teacher);

        if (!existingTeacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        // Check whether classroom exists
        const existingClassroom = await Classroom.findById(classroom);

        if (!existingClassroom) {
            return res.status(404).json({
                success: false,
                message: "Classroom not found",
            });
        }

        // Check whether time slot exists
        const existingTimeSlot = await TimeSlot.findById(timeSlot);

        if (!existingTimeSlot) {
            return res.status(404).json({
                success: false,
                message: "Time slot not found",
            });
        }

        // Check whether teacher is assigned to the subject
        const teacherSubjectAssignment = await TeacherSubject.findOne({
            teacher,
            subject,
        });

        if (!teacherSubjectAssignment) {
            return res.status(409).json({
                success: false,
                message: "Teacher is not assigned to this subject",
            });
        }

        // Check timetable conflicts
        const conflict = await checkTimetableConflict({
            department: department.toUpperCase(),
            semester,
            section: section.toUpperCase(),
            teacher,
            classroom,
            dayOfWeek,
            timeSlot,
        });

        if (conflict.hasConflict) {
            return res.status(409).json({
                success: false,
                type: conflict.type,
                message: conflict.message,
            });
        }

        // Create timetable entry
        const timetable = await Timetable.create({
            department: department.toUpperCase(),
            semester,
            section: section.toUpperCase(),
            subject,
            teacher,
            classroom,
            dayOfWeek,
            timeSlot,
        });

        res.status(201).json({
            success: true,
            message: "Timetable entry created successfully",
            data: timetable,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create timetable entry",
        });
    }
};

const getTimetable = async (req, res) => {
    try {
        const { department, semester, section, dayOfWeek } = req.query;

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
            .populate("teacher", "name employeeId email department designation")
            .populate(
                "classroom",
                "name roomType capacity"
            )
            .populate(
                "timeSlot",
                "name startTime endTime order"
            )
            .sort({
                dayOfWeek: 1,
            });

        res.status(200).json({
            success: true,
            count: timetable.length,
            data: timetable,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch timetable",
        });
    }
};

module.exports = {
    createTimetable,
    getTimetable,
};
