const Timetable = require("../models/timetable.model");
const Subject = require("../models/subject.model");
const Teacher = require("../models/teacher.model");
const TeacherSubject = require("../models/teacherSubject.model");

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
            startTime,
            endTime,
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
            !startTime ||
            !endTime
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

        // Create timetable entry
        const timetable = await Timetable.create({
            department: department.toUpperCase(),
            semester,
            section: section.toUpperCase(),
            subject,
            teacher,
            classroom,
            dayOfWeek,
            startTime,
            endTime,
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
            .sort({
                dayOfWeek: 1,
                startTime: 1,
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
