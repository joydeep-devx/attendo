const Timetable = require("../models/timetable.model");

const checkTimetableConflict = async ({
    department,
    semester,
    section,
    teacher,
    classroom,
    dayOfWeek,
    startTime,
    endTime,
}) => {
    // Find timetable entries on the same day
    const existingEntries = await Timetable.find({
        dayOfWeek,
    });

    for (const entry of existingEntries) {
        // Check whether time overlaps
        const timeOverlap =
            startTime < entry.endTime && endTime > entry.startTime;

        if (!timeOverlap) {
            continue;
        }

        // Section conflict
        if (
            entry.department === department &&
            entry.semester === semester &&
            entry.section === section
        ) {
            return {
                hasConflict: true,
                type: "SECTION",
                message: "Section already has a class during this time",
            };
        }

        // Teacher conflict
        if (entry.teacher.toString() === teacher.toString()) {
            return {
                hasConflict: true,
                type: "TEACHER",
                message: "Teacher already has a class during this time",
            };
        }

        // Classroom conflict
        if (entry.classroom === classroom) {
            return {
                hasConflict: true,
                type: "CLASSROOM",
                message: "Classroom is already occupied during this time",
            };
        }
    }

    return {
        hasConflict: false,
    };
};

module.exports = {
    checkTimetableConflict,
};
