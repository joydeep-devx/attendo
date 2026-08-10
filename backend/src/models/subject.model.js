const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        subjectCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        subjectName: {
            type: String,
            required: true,
            trim: true,
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },

        roomType: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        classesPerWeek: {
            type: Number,
            required: true,
            min: 1,
        },

        duration: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        timestamps: true,
    },
);

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
