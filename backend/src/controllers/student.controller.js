const Student = require("../models/student.model");

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

module.exports = {
    createStudent
};