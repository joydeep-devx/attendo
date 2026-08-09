const Student = require("../models/student.model");
const mongoose = require("mongoose");

const createStudent = async (req, res) => {
    try {
        const { studentRollNo, name, email, department, semester } = req.body;

        if (
            !studentRollNo ||
            !name ||
            !email ||
            !department ||
            semester === undefined
        ){
            return res.status(400).json({
                success: false,
                message: "All student fields are required"
            });
        }

        const student = await Student.create({
            studentRollNo,
            name,
            email,
            department,
            semester
        });

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];

            return res.status(409).json({
                success: false,
                message: `${duplicateField} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const registerFace = async (req, res) => {
    try {
        const { id } = req.params;
        const { faceEmbedding, faceEmbeddings, embedding, embeddings, image } = req.body;

        let extractedEmbeddings = [];

        // Option 1: Pre-generated embedding(s) passed in request body
        const singleEmb = faceEmbedding || embedding;
        const multiEmb = faceEmbeddings || embeddings;

        if (singleEmb && Array.isArray(singleEmb)) {
            if (singleEmb.length !== 128) {
                return res.status(400).json({
                    success: false,
                    message: `Face embedding must have 128 dimensions, got ${singleEmb.length}`
                });
            }
            extractedEmbeddings.push(singleEmb);
        }

        if (multiEmb && Array.isArray(multiEmb)) {
            for (let i = 0; i < multiEmb.length; i++) {
                const emb = multiEmb[i];
                if (!Array.isArray(emb) || emb.length !== 128) {
                    return res.status(400).json({
                        success: false,
                        message: `Embedding at index ${i} must have 128 dimensions`
                    });
                }
                extractedEmbeddings.push(emb);
            }
        }

        // Option 2: Image base64 string passed in request body -> call AI Service
        if (extractedEmbeddings.length === 0 && image) {
            const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";

            try {
                const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
                const imageBuffer = Buffer.from(base64Data, "base64");

                const formData = new FormData();
                const fileBlob = new Blob([imageBuffer], { type: "image/jpeg" });
                formData.append("image", fileBlob, "upload.jpg");

                const aiRes = await fetch(`${aiServiceUrl}/face/embedding`, {
                    method: "POST",
                    body: formData
                });

                const aiData = await aiRes.json();

                if (!aiRes.ok || !aiData.success || !aiData.face_detected) {
                    return res.status(400).json({
                        success: false,
                        message: aiData.message || "No face detected in the provided image"
                    });
                }

                for (const face of aiData.faces) {
                    if (face.embedding && face.embedding.length === 128) {
                        extractedEmbeddings.push(face.embedding);
                    }
                }
            } catch (aiErr) {
                console.error("AI Service Call Error:", aiErr.message);
                return res.status(503).json({
                    success: false,
                    message: `Failed to contact AI Service: ${aiErr.message}`
                });
            }
        }

        if (extractedEmbeddings.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Face embedding details (faceEmbedding or image) are required"
            });
        }

        // Find Student by Mongoose ObjectId or studentRollNo
        let student;
        if (mongoose.Types.ObjectId.isValid(id)) {
            student = await Student.findById(id);
        }
        if (!student) {
            student = await Student.findOne({ studentRollNo: id });
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Save embeddings to Student in MongoDB
        student.faceEmbeddings.push(...extractedEmbeddings);
        await student.save();

        return res.status(200).json({
            success: true,
            message: "Face registered successfully",
            data: {
                _id: student._id,
                studentRollNo: student.studentRollNo,
                name: student.name,
                email: student.email,
                department: student.department,
                semester: student.semester,
                faceEmbeddingsCount: student.faceEmbeddings.length
            }
        });

    } catch (error) {
        console.error("Error in registerFace:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createStudent,
    registerFace
};