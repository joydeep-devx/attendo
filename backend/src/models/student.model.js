const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentRollNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
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
        },

        section: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        faceEmbeddings: {
            type: [[Number]],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
