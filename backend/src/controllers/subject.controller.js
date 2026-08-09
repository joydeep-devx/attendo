const Subject = require("../models/subject.model");

const createSubject = async (req, res) => {
    try {
        const {
            subjectCode,
            subjectName,
            department,
            semester
        } = req.body;

        if (
            !subjectCode ||
            !subjectName ||
            !department ||
            semester === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All subject fields are required"
            });
        }

        const subject = await Subject.create({
            subjectCode,
            subjectName,
            department,
            semester
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: subject
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Subject code already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create subject"
        });
    }
};


const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch subjects"
        });
    }
};


module.exports = {
    createSubject,
    getSubjects
};