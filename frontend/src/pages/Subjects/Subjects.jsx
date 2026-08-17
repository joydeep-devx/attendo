import { useEffect, useState } from "react";
import { getSubjects } from "../../services/subject.service";
import { Link } from 'react-router-dom'

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const data = await getSubjects();
                setSubjects(data);
                setStatus("success");
            } catch (error) {
                setErrorMessage(error.message);
                setStatus("error");
            }
        }
        fetchSubjects();
    }, []);

    function renderContent() {
        if (status === "loading") {
            return <p className="text-slate">Loading subjects…</p>;
        }

        if (status === "error") {
            return (
                <p className="rounded-md bg-absent-soft px-4 py-3 text-absent">
                    {errorMessage}
                </p>
            );
        }

        if (subjects.length === 0) {
            return (
                <div className="rounded-lg border border-line bg-paper-raised px-6 py-12 text-center">
                    <p className="text-slate">No subjects yet.</p>
                </div>
            );
        }

        return (
            <div className="overflow-hidden rounded-lg border border-line bg-paper-raised">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-line">
                            {[
                                "Code",
                                "Name",
                                "Department",
                                "Semester",
                                "Room Type",
                                "Classes/Week",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="px-4 py-3 text-left font-mono text-xs font-normal uppercase tracking-wide text-slate"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject) => (
                            <tr
                                key={subject._id}
                                className="border-b border-line-soft last:border-0"
                            >
                                <td className="px-4 py-3 font-mono text-ink">
                                    {subject.subjectCode}
                                </td>
                                <td className="px-4 py-3 text-ink">
                                    {subject.subjectName}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {subject.department}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {subject.semester}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {subject.roomType}
                                </td>
                                <td className="px-4 py-3 text-slate">
                                    {subject.classesPerWeek}
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
                <h1 className="font-display text-2xl text-ink">Subjects</h1>
                <Link
                    to="/subjects/new"
                    className="rounded-md bg-indigo px-4 py-2 text-sm text-white hover:bg-indigo-dark"
                >
                    Add Subject
                </Link>
            </div>
            {renderContent()}
        </div>
    );
}

export default Subjects;
