const mongoose = require("mongoose");

const teacherSubjectSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        }
    },
    {
        timestamps: true
    }
);

teacherSubjectSchema.index(
    {
        teacher: 1,
        subject: 1
    },
    {
        unique: true
    }
);

const TeacherSubject = mongoose.model(
    "TeacherSubject",
    teacherSubjectSchema
);

module.exports = TeacherSubject;