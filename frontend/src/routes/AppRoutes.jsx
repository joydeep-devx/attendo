import { Routes, Route } from "react-router-dom";
import { motion } from "motion/react";
import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/Landing/Landing";
import Dashboard from "../pages/Dashboard/Dashboard";
import Subjects from "../pages/Subjects/Subjects";
import SubjectForm from "../pages/Subjects/SubjectForm";
import Teachers from "../pages/Teachers/Teachers";
import TeacherForm from "../pages/Teachers/TeacherForm";

function AppShell({ children }) {
    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </MainLayout>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
            <Route path="/subjects" element={<AppShell><Subjects /></AppShell>} />
            <Route path="/subjects/new" element={<AppShell><SubjectForm /></AppShell>} />
            <Route path="/teachers" element={<AppShell><Teachers /></AppShell>} />
            <Route path="/teachers/new" element={<AppShell><TeacherForm /></AppShell>} />
            <Route path="/teachers/:id/edit" element={<AppShell><TeacherForm /></AppShell>} />
        </Routes>
    );
}

export default AppRoutes;
