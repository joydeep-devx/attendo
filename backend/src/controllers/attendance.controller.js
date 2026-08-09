const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");
const Subject = require("../models/subject.model");

const createAttendance = async (req, res) => {
    try {
        const {
            student,
            subject,
            date,
            status
        } = req.body;

        // 1. Check required fields
        if (!student || !subject || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "Student, subject, date and status are required"
            });
        }

        // 2. Check whether the student exists
        const existingStudent = await Student.findById(student);

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // 3. Check whether the subject exists
        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        // 4. Validate status
        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either present or absent"
            });
        }

        // 5. Create attendance
        const attendance = await Attendance.create({
            student,
            subject,
            date,
            status
        });

        // 6. Send response
        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data: attendance
        });

    } catch (error) {
        console.error(error);

        // Duplicate attendance
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Attendance already exists for this student, subject and date"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to mark attendance"
        });
    }
};


const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if student exists
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const attendance = await Attendance.find({
            student: studentId
        })
            .populate("subject", "subjectCode subjectName")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student attendance"
        });
    }
};

const getSubjectAttendance = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { date } = req.query;

        // Check if subject exists
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        // Build query
        const query = {
            subject: subjectId
        };

        // Add date filter if provided
        if (date) {
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);

            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const attendance = await Attendance.find(query)
            .populate("student", "studentRollNo name email")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch subject attendance"
        });
    }
};

module.exports = {
    createAttendance,
    getStudentAttendance,
    getSubjectAttendance
};