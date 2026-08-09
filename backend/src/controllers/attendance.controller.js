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

module.exports = {
    createAttendance
};