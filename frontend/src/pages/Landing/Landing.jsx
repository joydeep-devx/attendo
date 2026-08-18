import { motion } from "motion/react";
import TimetablePreview from "./TimetablePreview";
import MotionLink from "../../components/MotionLink";
import Reveal from "../../components/Reveal";
import HowItWorks from "./HowItWorks";
import ConflictChecks from "./ConflictChecks";
import SquaresBackground from "../../components/SquaresBackground";
import TextType from "../../components/TextType";

const ROLES = [
    {
        name: "Admin",
        detail: "Configures departments, subjects, classrooms, and time slots. Generates and publishes timetables.",
    },
    {
        name: "Teacher",
        detail: "Sees their own weekly schedule and marks attendance for each class they take.",
    },
    {
        name: "Student",
        detail: "Views the timetable for their section and tracks their own attendance record.",
    },
];

const CAPABILITIES = [
    {
        title: "Conflict-free by construction",
        detail: "Every entry is checked against teacher, classroom, section, and time-slot availability before it is saved.",
    },
    {
        title: "Attendance at the point of teaching",
        detail: "Attendance is marked against the actual scheduled class, so records tie back to the timetable automatically.",
    },
    {
        title: "Dashboards that follow the data",
        detail: "Utilisation, teacher load, and attendance summaries are read from the same records the timetable is built on.",
    },
];

function Landing() {
    return (
        <div className="min-h-screen bg-paper">
            <header className="border-b border-line bg-paper-raised">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <span className="font-display text-lg font-semibold tracking-tight text-ink">
                        Scheduler.ai
                    </span>
                    <div className="flex items-center gap-2">
                        <MotionLink
                            to="/login"
                            className="rounded-md px-4 py-2 text-sm text-slate hover:text-ink"
                        >
                            Log in
                        </MotionLink>
                        <MotionLink
                            to="/register"
                            className="rounded-md bg-indigo px-4 py-2 text-sm font-medium text-white hover:bg-indigo-dark"
                        >
                            Register
                        </MotionLink>
                    </div>
                </div>
            </header>

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-50">
                    <SquaresBackground />
                </div>

                <div className="relative mx-auto max-w-6xl px-6 py-16">
                    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p className="font-mono text-xs uppercase tracking-wider text-indigo">
                                Timetable · Attendance · Insight
                            </p>
                            <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                                <TextType text="Timetables that build themselves and hold together" />
                            </h1>
                            <p className="mt-5 max-w-md text-slate">
                                Attendo generates a full weekly schedule across
                                departments, sections, and rooms, then keeps
                                attendance tied to the classes it scheduled. One
                                system, one source of truth.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <MotionLink
                                    to="/register"
                                    className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-dark"
                                >
                                    Get started
                                </MotionLink>
                                <MotionLink
                                    to="/dashboard"
                                    className="rounded-md border border-line bg-paper-raised px-5 py-2.5 text-sm text-ink hover:border-slate-soft"
                                >
                                    Explore the app
                                </MotionLink>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            whileHover={{
                                rotateX: 4,
                                rotateY: -6,
                                scale: 1.02,
                            }}
                            style={{ transformPerspective: 1000 }}
                            className="transform-3d"
                        >
                            <TimetablePreview />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="border-y border-line bg-paper-raised">
                <div className="mx-auto max-w-6xl px-6 py-14">
                    <Reveal>
                        <h2 className="font-display text-2xl text-ink">
                            Built for three kinds of user
                        </h2>
                    </Reveal>
                    <div className="mt-8 grid gap-6 sm:grid-cols-3">
                        {ROLES.map((role, i) => (
                            <Reveal key={role.name} delay={i * 0.1}>
                                 <div className="h-full rounded-lg border border-line p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-soft hover:shadow-md">
                                    <span className="font-mono text-xs uppercase tracking-wider text-indigo">
                                        {role.name}
                                    </span>
                                    <p className="mt-3 text-sm leading-relaxed text-slate">
                                        {role.detail}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <HowItWorks />
            <ConflictChecks />

            <section className="mx-auto max-w-6xl px-6 py-14">
                <div className="grid gap-8 sm:grid-cols-3">
                    {CAPABILITIES.map((item, i) => (
                        <Reveal key={item.title} delay={i * 0.1}>
                            <div key={item.title}>
                                <h3 className="font-display text-base text-ink">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate">
                                    {item.detail}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <footer className="border-t border-line">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                    <span className="font-display text-sm text-ink">
                        Attendo
                    </span>
                    <span className="font-mono text-xs text-slate-soft">
                        College scheduling system
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
