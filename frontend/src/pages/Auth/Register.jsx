import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Field from "../../components/Field";
import RoleSelector from "../../components/RoleSelector";
import FaceCapture from "../../components/FaceCapture";
import { register } from "../../services/auth.service";
import { enrollFace } from "../../services/faceEnrollment.service";
import { useAuth } from "../../context/AuthContext";

const initialFormState = {
    role: "student",
    name: "",
    username: "",
    email: "",
    password: "",
    studentRollNo: "",
    department: "",
    semester: "",
    section: "",
};

function Register() {
    const [formData, setFormData] = useState(initialFormState);
    const [step, setStep] = useState("details");
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    function handleRoleChange(role) {
        setFormData((prev) => ({ ...prev, role }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            await register({
                studentRollNo: formData.studentRollNo,
                name: formData.name,
                email: formData.email,
                department: formData.department,
                semester: Number(formData.semester),
                section: formData.section,
                username: formData.username,
                password: formData.password,
            });
            await login(formData.username, formData.password);
            setStatus("idle");
            setStep("face");
        } catch (error) {
            setErrorMessage(error.message);
            setStatus("idle");
        }
    }

    async function handleFaceComplete(images) {
        setStatus("submitting");
        try {
            await enrollFace(images);
            navigate("/dashboard");
        } catch (error) {
            setErrorMessage(error.message);
            setStatus("idle");
        }
    }

    if (step === "face") {
        return (
            <AuthLayout
                title="Enrol your face"
                subtitle="Used to mark your attendance automatically in class."
            >
                <FaceCapture
                    onComplete={handleFaceComplete}
                    onBack={() => navigate("/login")}
                    isSubmitting={status === "submitting"}
                />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Register as a student to view your timetable and attendance."
            footer={
                <>
                    Already registered?{" "}
                    <Link to="/login" className="text-indigo hover:text-indigo-dark">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <RoleSelector value={formData.role} onChange={handleRoleChange} />

                <Field
                    label="Full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. A. Sharma"
                    required
                />
                <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@college.edu"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Roll number"
                        name="studentRollNo"
                        value={formData.studentRollNo}
                        onChange={handleChange}
                        placeholder="e.g. 2201234"
                        required
                    />
                    <Field
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. CSE"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Semester"
                        name="semester"
                        type="number"
                        min="1"
                        max="8"
                        value={formData.semester}
                        onChange={handleChange}
                        placeholder="1–8"
                        required
                    />
                    <Field
                        label="Section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        placeholder="e.g. A"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="At least 4 characters"
                        minLength={4}
                        required
                    />
                    <Field
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        minLength={6}
                        required
                    />
                </div>

                {errorMessage && (
                    <p className="rounded-md bg-absent-soft px-3 py-2 text-sm text-absent">
                        {errorMessage}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
                >
                    {status === "submitting" ? "Creating account…" : "Create account"}
                </button>
            </form>
        </AuthLayout>
    );
}

export default Register;