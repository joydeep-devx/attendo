const Student = require("../models/student.model");
const mongoose = require("mongoose");

const createStudent = async (req, res) => {
    try {
        const { studentRollNo, name, email, department, semester } = req.body;

        if (
            !studentRollNo ||
            !name ||
            !email ||
            !department ||
            semester === undefined
        ){
            return res.status(400).json({
                success: false,
                message: "All student fields are required"
            });
        }

        const student = await Student.create({
            studentRollNo,
            name,
            email,
            department,
            semester
        });

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];

            return res.status(409).json({
                success: false,
                message: `${duplicateField} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const registerFace = async (req, res) => {
    try {
        const { id } = req.params;
        const { embeddings } = req.body;

        if (!embeddings || !Array.isArray(embeddings)) {
            return res.status(400).json({
                success: false,
                message: "Embeddings are required and must be an array"
            });
        }

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        for (const embedding of embeddings) {
            if (!Array.isArray(embedding) || embedding.length !== 128) {
                return res.status(400).json({
                    success: false,
                    message: "Each face embedding must contain exactly 128 numbers"
                });
            }
        }

        student.faceEmbeddings = embeddings;

        await student.save();

        res.status(200).json({
            success: true,
            message: "Face registered successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to register face"
        });
    }
};

module.exports = {
    createStudent,
    registerFace
};
