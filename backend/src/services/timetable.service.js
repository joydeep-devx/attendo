const Timetable = require("../models/timetable.model");
const TimeSlot = require("../models/timeSlot.model");

const checkTimetableConflict = async ({
    department,
    semester,
    section,
    teacher,
    classroom,
    dayOfWeek,
    timeSlot,
}) => {
    // Find the selected time slot
    const newTimeSlot = await TimeSlot.findById(timeSlot);

    if (!newTimeSlot) {
        return {
            hasConflict: true,
            type: "TIME_SLOT",
            message: "Time slot not found",
        };
    }

    // Find existing timetable entries on the same day
    const existingEntries = await Timetable.find({
        dayOfWeek,
    }).populate("timeSlot", "startTime endTime");


    for (const entry of existingEntries) {
        // Make sure the existing entry has a valid time slot
        if (!entry.timeSlot) {
            continue;
        }
        // Check whether the time slots overlap
        const timeOverlap =
            newTimeSlot.startTime < entry.timeSlot.endTime &&
            newTimeSlot.endTime > entry.timeSlot.startTime;

        // No time overlap means no conflict
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
