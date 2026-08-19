import { Routes, Route } from "react-router-dom";
import { motion } from "motion/react";
import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/Landing/Landing";
import Dashboard from "../pages/Dashboard/Dashboard";
import Subjects from "../pages/Subjects/Subjects";
import SubjectForm from "../pages/Subjects/SubjectForm";
import Teachers from "../pages/Teachers/Teachers";
import TeacherForm from "../pages/Teachers/TeacherForm";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import TimeSlots from "../pages/TimeSlots/TimeSlots";
import ScheduleConfigs from "../pages/ScheduleConfig/ScheduleConfigs";
import ScheduleConfigForm from "../pages/ScheduleConfig/ScheduleConfigForm";

function AppShell({ children, allowedRoles }) {
    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <MainLayout>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {children}
                </motion.div>
            </MainLayout>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <AppShell>
                        <Dashboard />
                    </AppShell>
                }
            />
            <Route
                path="/subjects"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <Subjects />
                    </AppShell>
                }
            />
            <Route
                path="/subjects/new"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <SubjectForm />
                    </AppShell>
                }
            />
            <Route
                path="/teachers"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <Teachers />
                    </AppShell>
                }
            />
            <Route
                path="/teachers/new"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <TeacherForm />
                    </AppShell>
                }
            />
            <Route
                path="/teachers/:id/edit"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <TeacherForm />
                    </AppShell>
                }
            />
            <Route
                path="/time-slots"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <TimeSlots />
                    </AppShell>
                }
            />
            <Route
                path="/schedule-config"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <ScheduleConfigs />
                    </AppShell>
                }
            />
            <Route
                path="/schedule-config/new"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <ScheduleConfigForm />
                    </AppShell>
                }
            />
            <Route
                path="/schedule-config/:id/edit"
                element={
                    <AppShell allowedRoles={["ADMIN"]}>
                        <ScheduleConfigForm />
                    </AppShell>
                }
            />
            Notes:
        </Routes>
    );
}

export default AppRoutes;
