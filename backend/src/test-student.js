const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const Student = require("./models/student.model");

const createStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const student = await Student.create({
            studentRollNo: "CSE001",
            name: "Test Student",
            email: "test@example.com",
            department: "CSE",
            semester: 5
        });

        console.log("Student created:");
        console.log(student);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

createStudent();