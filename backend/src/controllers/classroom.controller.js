const Classroom = require("../models/classroom.model");

const createClassroom = async (req, res) => {
    try {
        const {
            name,
            roomType,
            capacity,
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !roomType ||
            capacity === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, room type and capacity are required",
            });
        }

        // Create classroom
        const classroom = await Classroom.create({
            name: name.trim(),
            roomType: roomType.trim().toUpperCase(),
            capacity,
        });

        res.status(201).json({
            success: true,
            message: "Classroom created successfully",
            data: classroom,
        });
    } catch (error) {
        console.error(error);

        // Duplicate classroom name
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Classroom with this name already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create classroom",
        });
    }
};

const getClassrooms = async (req, res) => {
    try {
        const { roomType } = req.query;

        const query = {};

        if (roomType) {
            query.roomType = roomType.trim().toUpperCase();
        }

        const classrooms = await Classroom.find(query).sort({
            name: 1,
        });

        res.status(200).json({
            success: true,
            count: classrooms.length,
            data: classrooms,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch classrooms",
        });
    }
};

const updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            roomType,
            capacity,
        } = req.body;

        // Find classroom
        const classroom = await Classroom.findById(id);

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: "Classroom not found",
            });
        }

        // Update only provided fields
        if (name !== undefined) {
            classroom.name = name.trim();
        }

        if (roomType !== undefined) {
            classroom.roomType = roomType.trim().toUpperCase();
        }

        if (capacity !== undefined) {
            classroom.capacity = capacity;
        }

        const updatedClassroom = await classroom.save();

        res.status(200).json({
            success: true,
            message: "Classroom updated successfully",
            data: updatedClassroom,
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Classroom with this name already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update classroom",
        });
    }
};

const deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findById(id);

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: "Classroom not found",
            });
        }

        await classroom.deleteOne();

        res.status(200).json({
            success: true,
            message: "Classroom deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete classroom",
        });
    }
};

module.exports = {
    createClassroom,
    getClassrooms,
    updateClassroom,
    deleteClassroom,
};