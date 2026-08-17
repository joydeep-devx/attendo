const Teacher = require("../models/teacher.model");

const createTeacher = async (req, res) => {
    try {
        const {
            name,
            employeeId,
            email,
            department,
            designation
        } = req.body;

        if (
            !name ||
            !employeeId ||
            !email ||
            !department ||
            !designation
        ) {
            return res.status(400).json({
                success: false,
                message: "All teacher fields are required"
            });
        }

        const existingTeacher = await Teacher.findOne({
            $or: [
                { employeeId },
                { email }
            ]
        });

        if (existingTeacher) {
            return res.status(409).json({
                success: false,
                message: "Teacher with this employee ID or email already exists"
            });
        }

        const teacher = await Teacher.create({
            name,
            employeeId,
            email,
            department,
            designation
        });

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            data: teacher
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create teacher"
        });
    }
};

const getTeachers = async (req, res) => {
    try {
        const { department } = req.query;

        const filter = {};

        if (department) {
            filter.department = department;
        }

        const teachers = await Teacher.find(filter)
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teachers"
        });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            employeeId,
            email,
            department,
            designation
        } = req.body;

        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        if (employeeId !== undefined && employeeId !== teacher.employeeId) {
            const existingTeacher = await Teacher.findOne({
                employeeId,
                _id: { $ne: id }
            });

            if (existingTeacher) {
                return res.status(409).json({
                    success: false,
                    message: "Employee ID already belongs to another teacher"
                });
            }

            teacher.employeeId = employeeId;
        }

        if (email !== undefined && email !== teacher.email) {
            const existingTeacher = await Teacher.findOne({
                email,
                _id: { $ne: id }
            });

            if (existingTeacher) {
                return res.status(409).json({
                    success: false,
                    message: "Email already belongs to another teacher"
                });
            }

            teacher.email = email;
        }

        if (name !== undefined) {
            teacher.name = name;
        }

        if (department !== undefined) {
            teacher.department = department;
        }

        if (designation !== undefined) {
            teacher.designation = designation;
        }

        await teacher.save();

        res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            data: teacher
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update teacher"
        });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        await Teacher.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Teacher deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete teacher"
        });
    }
};

module.exports = {
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher
};