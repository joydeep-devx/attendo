const validateTimeFormat = (time) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    return timeRegex.test(time);
};

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
};

const validateTimeRange = (startTime, endTime) => {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
        return false;
    }

    return timeToMinutes(startTime) < timeToMinutes(endTime);
};

const validateWorkingDays = (workingDays) => {
    const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    if (!Array.isArray(workingDays) || workingDays.length === 0) {
        return {
            valid: false,
            message: "At least one working day is required",
        };
    }

    const uniqueDays = new Set(workingDays);

    if (uniqueDays.size !== workingDays.length) {
        return {
            valid: false,
            message: "Working days cannot contain duplicates",
        };
    }

    for (const day of workingDays) {
        if (!validDays.includes(day)) {
            return {
                valid: false,
                message: `Invalid working day: ${day}`,
            };
        }
    }

    return {
        valid: true,
    };
};

const validateTimeSlots = (timeSlots) => {
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
        return {
            valid: false,
            message: "At least one time slot is required",
        };
    }

    for (const slot of timeSlots) {
        if (!slot.startTime || !slot.endTime) {
            return {
                valid: false,
                message: "Every time slot must have startTime and endTime",
            };
        }

        if (!validateTimeRange(slot.startTime, slot.endTime)) {
            return {
                valid: false,
                message: `Invalid time slot: ${slot.startTime} - ${slot.endTime}`,
            };
        }
    }

    // Check for overlapping time slots
    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
            const first = timeSlots[i];
            const second = timeSlots[j];

            const firstStart = timeToMinutes(first.startTime);
            const firstEnd = timeToMinutes(first.endTime);

            const secondStart = timeToMinutes(second.startTime);
            const secondEnd = timeToMinutes(second.endTime);

            const overlap =
                firstStart < secondEnd &&
                firstEnd > secondStart;

            if (overlap) {
                return {
                    valid: false,
                    message:
                        `Time slots overlap: ${first.startTime}-${first.endTime} ` +
                        `and ${second.startTime}-${second.endTime}`,
                };
            }
        }
    }

    return {
        valid: true,
    };
};

const validateBreaks = (breaks = []) => {
    if (!Array.isArray(breaks)) {
        return {
            valid: false,
            message: "Breaks must be an array",
        };
    }

    for (const breakItem of breaks) {
        if (
            !breakItem.name ||
            !breakItem.startTime ||
            !breakItem.endTime
        ) {
            return {
                valid: false,
                message:
                    "Every break must have name, startTime and endTime",
            };
        }

        if (
            !validateTimeRange(
                breakItem.startTime,
                breakItem.endTime
            )
        ) {
            return {
                valid: false,
                message:
                    `Invalid break time: ${breakItem.startTime} - ${breakItem.endTime}`,
            };
        }
    }

    // Check whether breaks overlap each other
    for (let i = 0; i < breaks.length; i++) {
        for (let j = i + 1; j < breaks.length; j++) {
            const first = breaks[i];
            const second = breaks[j];

            const firstStart = timeToMinutes(first.startTime);
            const firstEnd = timeToMinutes(first.endTime);

            const secondStart = timeToMinutes(second.startTime);
            const secondEnd = timeToMinutes(second.endTime);

            const overlap =
                firstStart < secondEnd &&
                firstEnd > secondStart;

            if (overlap) {
                return {
                    valid: false,
                    message:
                        `Breaks overlap: ${first.startTime}-${first.endTime} ` +
                        `and ${second.startTime}-${second.endTime}`,
                };
            }
        }
    }

    return {
        valid: true,
    };
};

const validateScheduleConfig = ({
    workingDays,
    timeSlots,
    breaks,
}) => {
    const workingDaysValidation =
        validateWorkingDays(workingDays);

    if (!workingDaysValidation.valid) {
        return workingDaysValidation;
    }

    const timeSlotsValidation =
        validateTimeSlots(timeSlots);

    if (!timeSlotsValidation.valid) {
        return timeSlotsValidation;
    }

    const breaksValidation =
        validateBreaks(breaks);

    if (!breaksValidation.valid) {
        return breaksValidation;
    }

    return {
        valid: true,
    };
};

module.exports = {
    validateScheduleConfig,
};