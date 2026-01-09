// MockDataService.js - V1 Schema-Compliant Mock Data
export const MOCK_CMR_DATA = {
    users: [
        { _id: "U001", role: "FACULTY", name: "Dr. Rao", faculty_id: "F001", email: "rao@cmr.edu" },
        { _id: "U002", role: "HOD", name: "Dr. Sharma", department: "CSE" }
    ],
    students: Array.from({ length: 50 }, (_, i) => ({
        _id: `S${100 + i}`,
        rollno: `22K61A0${501 + i}`,
        name: `Student ${i + 1}`,
        department: "CSE",
        year: "2",
        section: "A",
        embedding: [/* 128d vector mock */]
    })),
    classes: [
        { _id: "C_CSE_2A_AI", department: "CSE", year: "2", section: "A", subject: "Artificial Intelligence", code: "CS401" }
    ],
    timetables: [
        {
            _id: "T001",
            class_id: "C_CSE_2A_AI",
            faculty_id: "F001",
            day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            start_time: "09:00",
            end_time: "17:00" // Wide window for demo
        }
    ],
    attendance_records: [], // Empty initially
    audit_logs: [],
    sessions: [] // To be populated when faculty starts attendance
};

export const MockDataService = {
    getData: () => MOCK_CMR_DATA,

    // Auto-detect session based on time
    detectCurrentSession: (facultyId) => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const timetableMatch = MOCK_CMR_DATA.timetables.find(t =>
            t.facultyId === facultyId || true // Simplified for demo
        );

        if (timetableMatch) {
            const classInfo = MOCK_CMR_DATA.classes.find(c => c._id === timetableMatch.class_id);
            return {
                ...timetableMatch,
                classInfo,
                displayTime: currentTime
            };
        }
        return null;
    }
};
