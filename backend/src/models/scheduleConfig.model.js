const mongoose = require("mongoose");

const scheduleConfigSchema = new mongoose.Schema(
    {
        department: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },

        section: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        workingDays: [
            {
                type: String,
                enum: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ],
            },
        ],

        timeSlots: [
            {
                startTime: {
                    type: String,
                    required: true,
                },

                endTime: {
                    type: String,
                    required: true,
                },
            },
        ],

        breaks: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                startTime: {
                    type: String,
                    required: true,
                },

                endTime: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// One schedule configuration per department + semester + section
scheduleConfigSchema.index(
    {
        department: 1,
        semester: 1,
        section: 1,
    },
    {
        unique: true,
    }
);

const ScheduleConfig = mongoose.model(
    "ScheduleConfig",
    scheduleConfigSchema
);

module.exports = ScheduleConfig;