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

const getAttendanceSummary = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { date, section } = req.query;

        // 1. Validate required query parameters
        if (!date || !section) {
            return res.status(400).json({
                success: false,
                message: "Date and section are required"
            });
        }

        // 2. Check whether subject exists
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        // 3. Find students who should attend this subject
        const students = await Student.find({
            department: subject.department,
            semester: subject.semester,
            section: section.toUpperCase()
        });

        // 4. Define the date range
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        // 5. Get attendance records for this subject and date
        const attendance = await Attendance.find({
            subject: subjectId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // 6. Create a set of students who are present
        const presentStudentIds = new Set(
            attendance
                .filter(record => record.status === "present")
                .map(record => record.student.toString())
        );

        // 7. Calculate summary
        const totalStudents = students.length;

        const present = students.filter(student =>
            presentStudentIds.has(student._id.toString())
        ).length;

        const absent = totalStudents - present;

        const attendancePercentage =
            totalStudents === 0
                ? 0
                : Number(((present / totalStudents) * 100).toFixed(2));

        res.status(200).json({
            success: true,
            data: {
                subject: {
                    id: subject._id,
                    subjectCode: subject.subjectCode,
                    subjectName: subject.subjectName
                },
                date,
                section,
                totalStudents,
                present,
                absent,
                attendancePercentage
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to generate attendance summary"
        });
    }
};

module.exports = {
    createAttendance,
    getStudentAttendance,
    getSubjectAttendance,
    getAttendanceSummary
};