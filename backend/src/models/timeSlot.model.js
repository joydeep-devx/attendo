const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        startTime: {
            type: String,
            required: true,
            trim: true
        },

        endTime: {
            type: String,
            required: true,
            trim: true
        },

        order: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

timeSlotSchema.index({
    order: 1
});

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

module.exports = TimeSlot;