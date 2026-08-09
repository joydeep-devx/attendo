const Student = require("../models/student.model");

const createStudent = async (req, res) => {
    try {
        const { studentRollNo, name, email, department, semester ,section } = req.body;

        if (
            !studentRollNo ||
            !name ||
            !email ||
            !department ||
            !section ||
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
            semester,
            section
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

const getStudents = async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
};

const getStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student"
        });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
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
            message: "Failed to update student"
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete student"
        });
    }
};

module.exports = {
    createStudent,
    registerFace,
    getStudents,
    getStudent,
    updateStudent,
    deleteStudent
};