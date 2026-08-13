const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const Student = require("../models/student.model");

const register = async (req, res) => {
    try {
        const {
            studentRollNo,
            name,
            email,
            department,
            semester,
            section,
            username,
            password,
        } = req.body;

        if (
            !studentRollNo ||
            !name ||
            !email ||
            !department ||
            !section ||
            !username ||
            !password ||
            semester === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });
        }

        const student = await Student.create({
            studentRollNo,
            name,
            email,
            department,
            semester,
            section,
        });

        const user = await User.create({
            username,
            password,
            role: "STUDENT",
            profile: student._id,
            profileModel: "Student",
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

const me = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("profile");

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

const logout = async (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

module.exports = {
    register,
    login,
    logout,
    me,
};
