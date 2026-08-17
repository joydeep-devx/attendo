import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeachers, deleteTeacher } from "../../services/teacher.service";

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        async function fetchTeachers() {
            try {
                const data = await getTeachers();
                setTeachers(data);
                setStatus("success");
            } catch (error) {
                setErrorMessage(error.message);
                setStatus("error");
            }
        }
        fetchTeachers();
    }, []);

    async function handleDelete(teacher) {
        const confirmed = window.confirm(
            `Delete ${teacher.name}? This cannot be undone.`,
        );
        if (!confirmed) return;

        setDeletingId(teacher._id);
        try {
            await deleteTeacher(teacher._id);
            setTeachers((prev) => prev.filter((t) => t._id !== teacher._id));
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    function renderContent() {
        if (status === "loading") {
            return <p className="text-slate">Loading teachers…</p>;
        }

        if (status === "error") {
            return (
                <p className="rounded-md bg-absent-soft px-4 py-3 text-absent">
                    {errorMessage}
                </p>
            );
        }

        if (teachers.length === 0) {
            return (
                <div className="rounded-lg border border-line bg-paper-raised px-6 py-12 text-center">
                    <p className="text-slate">No teachers yet.</p>
                </div>
            );
        }

        return (
            <div className="overflow-hidden rounded-lg border border-line bg-paper-raised">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-line">
                            {[
                                "Employee ID",
                                "Name",
                                "Email",
                                "Department",
                                "Designation",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="px-4 py-3 text-left font-mono text-xs font-normal uppercase tracking-wide text-slate"
                                >
                                    {heading}
                                </th>
                            ))}
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr
                                key={teacher._id}
                                className="border-b border-line-soft last:border-0"
                            >
                                <td className="px-4 py-3 font-mono text-ink">
                                    {teacher.employeeId}
                                </td>
                                <td className="px-4 py-3 text-ink">
                                    {teacher.name}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {teacher.email}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {teacher.department}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {teacher.designation}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        to={`/teachers/${teacher._id}/edit`}
                                        className="mr-4 text-sm text-slate hover:text-indigo"
                                    >
                                    Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(teacher)}
                                        disabled={deletingId === teacher._id}
                                        className="text-sm text-slate hover:text-absent disabled:opacity-50"
                                    >
                                        {deletingId === teacher._id
                                            ? "Deleting…"
                                            : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-display text-2xl text-ink">Teachers</h1>
                <Link
                    to="/teachers/new"
                    className="rounded-md bg-indigo px-4 py-2 text-sm text-white hover:bg-indigo-dark"
                >
                    Add Teacher
                </Link>
            </div>
            {renderContent()}
        </div>
    );
}

export default Teachers;
