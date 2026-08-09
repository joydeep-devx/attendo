const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
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

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },

        classroom: {
            type: String,
            required: true,
            trim: true,
        },

        dayOfWeek: {
            type: String,
            required: true,
            trim: true,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ]
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
    {
        timestamps: true,
    },
);

timetableSchema.index({
    department: 1,
    semester: 1,
    section: 1,
    dayOfWeek: 1
});

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;
