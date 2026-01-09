// MERNBackend.js
const API_URL = 'https://campusflow-api.now.sh'; // Placeholder for Vercel/Render backend

export const MERNBackend = {
    async fetchTimetable(facultyId) {
        console.log(`[MERN] Fetching timetable for ${facultyId}`);
        // Simulate API call
        return {
            course: 'CS401: Artificial Intelligence',
            venue: 'Block C - R405',
            time: '09:00 AM'
        };
    },

    async submitAttendance(sessionId, attendanceData) {
        console.log(`[MERN] Submitting to /api/attendance/${sessionId}`);
        // Mock response
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1500));
    },

    async getStudentStats(studentId) {
        console.log(`[MERN] Fetching stats for student ${studentId}`);
        return [
            { code: 'CS101', percent: 78, status: 'NORMAL' },
            { code: 'MA101', percent: 92, status: 'EXCELLENT' },
            { code: 'AI402', percent: 65, status: 'WARNING' }
        ];
    }
};
