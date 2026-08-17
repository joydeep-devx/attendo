import { useRef } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useReducedMotion,
} from "motion/react";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";

const STEPS = [
    {
        title: "Set up the inputs",
        detail: "Add subjects, teachers, classrooms, and time slots. Assign which teacher can take which subject.",
    },
    {
        title: "Configure the schedule",
        detail: "Define working days, periods, and breaks per department, semester, and section.",
    },
    {
        title: "Generate the timetable",
        detail: "Classes are placed across the week and validated against every constraint before being saved.",
    },
    {
        title: "Teach and track",
        detail: "Teachers mark attendance against scheduled classes. Dashboards read from the same records.",
    },
];

function Step({ step, index, total, progress, reduceMotion }) {
    const start = index / total;
    const end = (index + 0.7) / total;

    const fill = useTransform(progress, [start, end], [0, 1]);
    const numberColor = useTransform(
        progress,
        [start, end],
        ["#8a93a2", "#3d4eea"],
    );
    const bodyOpacity = useTransform(progress, [start, end], [0.45, 1]);

    return (
        <motion.div
            style={{ opacity: reduceMotion ? 1 : bodyOpacity }}
            className="group cursor-default"
        >
            <div className="relative h-px w-full bg-line">
                <motion.div
                    style={{ scaleX: reduceMotion ? 1 : fill }}
                    className="absolute inset-0 origin-left bg-indigo"
                />
            </div>

            <div className="-mx-3 rounded-md px-3 py-3 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-indigo-soft/40">
                <motion.span
                    style={{ color: reduceMotion ? "#3d4eea" : numberColor }}
                    className="block font-mono text-xs transition-transform duration-200 group-hover:scale-110 origin-left"
                >
                    {String(index + 1).padStart(2, "0")}
                </motion.span>

                <h3 className="mt-2 font-display text-base text-ink transition-colors duration-200 group-hover:text-indigo-dark">
                    {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                    {step.detail}
                </p>
            </div>
        </motion.div>
    );
}

function HowItWorks() {
    const containerRef = useRef(null);
    const reduceMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 85%", "end 55%"],
    });

    return (
        <section className="mx-auto max-w-6xl px-6 py-14">
            <Reveal>
                <SectionHeading
                    eyebrow="How it works"
                    title="From empty grid to running term"
                />
            </Reveal>

            <div
                ref={containerRef}
                className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
                {STEPS.map((step, index) => (
                    <Step
                        key={step.title}
                        step={step}
                        index={index}
                        total={STEPS.length}
                        progress={scrollYProgress}
                        reduceMotion={reduceMotion}
                    />
                ))}
            </div>
        </section>
    );
}

export default HowItWorks;
