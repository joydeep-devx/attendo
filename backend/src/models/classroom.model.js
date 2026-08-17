const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        roomType: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

classroomSchema.index(
    {
        name: 1,
    },
    {
        unique: true,
    }
);

const Classroom = mongoose.model("Classroom", classroomSchema);

module.exports = Classroom;