const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 4,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            required: true,
            enum: ["ADMIN", "TEACHER", "STUDENT"],
        },

        profile: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "profileModel",
            default: null,
        },

        profileModel: {
            type: String,
            enum: ["Student", "Teacher"],
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;