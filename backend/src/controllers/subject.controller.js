const Subject = require("../models/subject.model");

const createSubject = async (req, res) => {
    try {
        const {
            subjectCode,
            subjectName,
            department,
            semester,
            roomType,
            classesPerWeek,
            duration,
        } = req.body;

        if (
            !subjectCode ||
            !subjectName ||
            !department ||
            !roomType ||
            !classesPerWeek ||
            !duration ||
            semester === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Subject code, subject name, department, semester, room type, classes per week and duration are required",
            });
        }

        const subject = await Subject.create({
            subjectCode: subjectCode.trim().toUpperCase(),
            subjectName: subjectName.trim(),
            department: department.trim().toUpperCase(),
            semester,
            roomType: roomType.trim().toUpperCase(),
            classesPerWeek,
            duration,
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: subject,
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Subject code already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create subject",
        });
    }
};

const getSubjects = async (req, res) => {
    try {
        const { department, semester } = req.query;
        const query = {};

        if (department) {
            query.department = department.trim().toUpperCase();
        }

        if (semester) {
            query.semester = Number(semester);
        }

        const subjects = await Subject.find(query);

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch subjects",
        });
    }
};

module.exports = {
    createSubject,
    getSubjects,
};
