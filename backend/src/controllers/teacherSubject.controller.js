const Teacher = require("../models/teacher.model");
const Subject = require("../models/subject.model");
const TeacherSubject = require("../models/teacherSubject.model");

const assignTeacherToSubject = async (req, res) => {
    try {
        const { teacherId, subjectId } = req.body;

        if (!teacherId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "Teacher ID and Subject ID are required"
            });
        }

        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        const existingAssignment = await TeacherSubject.findOne({
            teacher: teacherId,
            subject: subjectId
        });

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: "Teacher is already assigned to this subject"
            });
        }

        const assignment = await TeacherSubject.create({
            teacher: teacherId,
            subject: subjectId
        });

        res.status(201).json({
            success: true,
            message: "Teacher assigned to subject successfully",
            data: assignment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to assign teacher to subject"
        });
    }
};

const getTeachersBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        const assignments = await TeacherSubject.find({
            subject: subjectId
        }).populate(
            "teacher",
            "name employeeId email department designation"
        );

        const teachers = assignments.map(
            (assignment) => assignment.teacher
        );

        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teachers for subject"
        });
    }
};

const getSubjectsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        const assignments = await TeacherSubject.find({
            teacher: teacherId
        }).populate(
            "subject"
        );

        const subjects = assignments.map(
            (assignment) => assignment.subject
        );

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch subjects for teacher"
        });
    }
};

module.exports = {
    assignTeacherToSubject,
    getTeachersBySubject,
    getSubjectsByTeacher
};