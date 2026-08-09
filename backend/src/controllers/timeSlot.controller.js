const TimeSlot = require("../models/timeSlot.model");
const Timetable = require("../models/timetable.model");

const createTimeSlot = async (req, res) => {
    try {
        const {
            name,
            startTime,
            endTime,
            order
        } = req.body;

        if (!name || !startTime || !endTime || order === undefined) {
            return res.status(400).json({
                success: false,
                message: "All time slot fields are required"
            });
        }

        const existingTimeSlot = await TimeSlot.findOne({
            order
        });

        if (existingTimeSlot) {
            return res.status(409).json({
                success: false,
                message: "A time slot with this order already exists"
            });
        }

        const timeSlot = await TimeSlot.create({
            name,
            startTime,
            endTime,
            order
        });

        res.status(201).json({
            success: true,
            message: "Time slot created successfully",
            data: timeSlot
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create time slot"
        });
    }
};

const getTimeSlots = async (req, res) => {
    try {
        const timeSlots = await TimeSlot.find()
            .sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: timeSlots.length,
            data: timeSlots
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch time slots"
        });
    }
};

const updateTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            startTime,
            endTime,
            order
        } = req.body;

        const timeSlot = await TimeSlot.findById(id);

        if (!timeSlot) {
            return res.status(404).json({
                success: false,
                message: "Time slot not found"
            });
        }

        // If order is being changed, make sure another slot
        // isn't already using that order.
        if (order !== undefined && order !== timeSlot.order) {
            const existingTimeSlot = await TimeSlot.findOne({
                order,
                _id: { $ne: id }
            });

            if (existingTimeSlot) {
                return res.status(409).json({
                    success: false,
                    message: "A time slot with this order already exists"
                });
            }

            timeSlot.order = order;
        }

        if (name !== undefined) {
            timeSlot.name = name;
        }

        if (startTime !== undefined) {
            timeSlot.startTime = startTime;
        }

        if (endTime !== undefined) {
            timeSlot.endTime = endTime;
        }

        await timeSlot.save();

        res.status(200).json({
            success: true,
            message: "Time slot updated successfully",
            data: timeSlot
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update time slot"
        });
    }
};

const deleteTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;

        const timeSlot = await TimeSlot.findById(id);

        if (!timeSlot) {
            return res.status(404).json({
                success: false,
                message: "Time slot not found"
            });
        }

        const timetableEntry = await Timetable.findOne({
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
        });

        if (timetableEntry) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete time slot because it is being used in the timetable"
            });
        }

        await TimeSlot.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Time slot deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete time slot"
        });
    }
};

module.exports = {
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deleteTimeSlot
};