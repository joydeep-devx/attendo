import { Link } from "react-router-dom";
import { motion } from "motion/react";
import SquaresBackground from "../../components/SquaresBackground";

function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <header className="border-b border-line bg-paper-raised">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link
                        to="/"
                        className="font-display text-lg font-semibold tracking-tight text-ink"
                    >
                        Scheduler.ai
                    </Link>
                    <Link
                        to="/"
                        className="font-mono text-xs uppercase tracking-wide text-slate hover:text-indigo"
                    >
                        ← Back to home
                    </Link>
                </div>
            </header>

            <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
                <div className="pointer-events-none absolute inset-0 opacity-50">
                    <SquaresBackground />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative w-full max-w-md"
                >
                    <h1 className="font-display text-2xl text-ink">{title}</h1>
                    <p className="mt-2 text-sm text-slate">{subtitle}</p>

                    <div className="mt-6 rounded-lg border border-line bg-paper-raised p-6">
                        {children}
                    </div>

                    <p className="mt-5 text-center text-sm text-slate">
                        {footer}
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

export default AuthLayout;
