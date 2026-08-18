import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import {
    getTimeSlots,
    createTimeSlot,
    deleteTimeSlot,
} from "../../services/timeSlot.service";

const CANDIDATES = [
    { name: "Period 1", startTime: "09:45", endTime: "10:45", order: 1 },
    { name: "Period 2", startTime: "10:45", endTime: "11:45", order: 2 },
    { name: "Period 3", startTime: "11:45", endTime: "12:45", order: 3 },
    { name: "Period 4", startTime: "13:30", endTime: "14:30", order: 4 },
    { name: "Period 5", startTime: "14:30", endTime: "15:30", order: 5 },
    { name: "Period 6", startTime: "15:30", endTime: "16:30", order: 6 },
];

const LUNCH = { startTime: "12:45", endTime: "13:30" };

function TimeSlots() {
    const [timeSlots, setTimeSlots] = useState([]);
    const [status, setStatus] = useState("loading");
    const [pendingOrder, setPendingOrder] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function load() {
            try {
                setTimeSlots(await getTimeSlots());
                setStatus("success");
            } catch (error) {
                setErrorMessage(error.message);
                setStatus("error");
            }
        }
        load();
    }, []);

    function findExisting(candidate) {
        return timeSlots.find(
            (slot) =>
                slot.startTime === candidate.startTime &&
                slot.endTime === candidate.endTime,
        );
    }

    async function toggle(candidate) {
        const existing = findExisting(candidate);
        setPendingOrder(candidate.order);
        setErrorMessage("");

        try {
            if (existing) {
                await deleteTimeSlot(existing._id);
                setTimeSlots((prev) =>
                    prev.filter((slot) => slot._id !== existing._id),
                );
            } else {
                const created = await createTimeSlot(candidate);
                setTimeSlots((prev) => [...prev, created]);
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setPendingOrder(null);
        }
    }

    if (status === "loading") {
        return <p className="text-slate">Loading time slots…</p>;
    }

    if (status === "error") {
        return (
            <p className="rounded-md bg-absent-soft px-4 py-3 text-absent">
                {errorMessage}
            </p>
        );
    }

    const enabledCount = CANDIDATES.filter(findExisting).length;

    return (
        <div className="max-w-2xl">
            <h1 className="font-display text-2xl text-ink">Time Slots</h1>
            <p className="mt-1 text-sm text-slate">
                Click a period to enable it. {enabledCount} of{" "}
                {CANDIDATES.length} enabled.
            </p>

            {errorMessage && (
                <p className="mt-4 rounded-md bg-absent-soft px-4 py-3 text-sm text-absent">
                    {errorMessage}
                </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
                {CANDIDATES.map((candidate, index) => {
                    const existing = findExisting(candidate);
                    const isPending = pendingOrder === candidate.order;
                    const showLunchAfter =
                        candidate.endTime === LUNCH.startTime;

                    return (
                        <div
                            key={candidate.order}
                            className="flex flex-col gap-2"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(candidate)}
                                disabled={isPending}
                                className={`group flex items-center gap-4 rounded-lg border px-4 py-3 text-left transition-all duration-200 disabled:translate-x-0 disabled:opacity-60 disabled:shadow-none ${
                                    existing
                                        ? "border-indigo bg-indigo-soft hover:translate-x-1 hover:shadow-md"
                                        : "border-dashed border-line bg-paper-raised hover:translate-x-1 hover:border-indigo hover:border-solid hover:bg-indigo-soft/30 hover:shadow-md"
                                }`}
                            >
                                <span
                                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition-all duration-200 group-hover:scale-110 ${
  existing
    ? 'bg-indigo text-white group-hover:rotate-12'
    : 'bg-line-soft text-slate-soft group-hover:bg-indigo group-hover:text-white'
}`}
                                >
                                    {existing ? (
                                        <Check size={16} />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                </span>

                                <span className="flex flex-1 flex-col">
                                    <span
                                        className={`text-sm font-medium ${
                                            existing
                                                ? "text-indigo-dark"
                                                : "text-slate"
                                        }`}
                                    >
                                        {candidate.name}
                                    </span>
                                    <span className="font-mono text-xs text-slate-soft">
                                        {candidate.startTime} –{" "}
                                        {candidate.endTime}
                                    </span>
                                </span>

                                <span className="font-mono text-[10px] uppercase tracking-wide text-slate-soft">
                                    {isPending
                                        ? "Saving…"
                                        : existing
                                          ? "Enabled"
                                          : "Click to add"}
                                </span>
                            </button>

                            {showLunchAfter && (
                                <div className="flex items-center gap-4 rounded-lg border border-amber/30 bg-amber-soft px-4 py-2.5">
                                    <span className="grid h-8 w-8 shrink-0 place-items-center font-mono text-xs text-amber">
                                        ☕
                                    </span>
                                    <span className="flex flex-1 flex-col">
                                        <span className="text-sm font-medium text-amber">
                                            Lunch
                                        </span>
                                        <span className="font-mono text-xs text-amber/70">
                                            {LUNCH.startTime} – {LUNCH.endTime}
                                        </span>
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tracking-wide text-amber/70">
                                        Break
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-slate-soft">
                Breaks are configured separately under Schedule Configuration —
                lunch is shown here for context only.
            </p>
        </div>
    );
}

export default TimeSlots;
