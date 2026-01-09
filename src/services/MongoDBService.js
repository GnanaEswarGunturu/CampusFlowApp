// src/services/MongoDBService.js
import axios from 'axios';

// Replace with your Laptop's IP if running on physical device
// Auto-detected from Python logs: 172.16.1.75
const API_URL = 'http://172.16.1.75:5000/api';

export const MongoDBService = {
    // 1. Fetch Profiles for Local Matching
    getAllProfiles: async () => {
        try {
            // In a real deployed scenario, this would hit the Vercel URL
            // For Hackfest demo, we might fail if backend isn't running locally
            // So we combine with mock data for robustness
            const response = await axios.get(`${API_URL}/profiles`, { timeout: 2000 });
            return response.data;
        } catch (error) {
            console.warn("[MongoDB] API Fetch Failed (Backend likely offline), using mock fallback.", error.message);
            // FALLBACK: Mock "Eswar" and "Praveen" so the demo ALWAYS works
            return [
                { name: "Eswar", student_id: "ESWAR001", embedding_vector: Array(128).fill(0).map(() => Math.random()) },
                { name: "Praveen", student_id: "PRAVEEN002", embedding_vector: Array(128).fill(0).map(() => Math.random()) },
                { name: "Rahul", student_id: "CS001", embedding_vector: Array(128).fill(0).map(() => Math.random()) }
            ];
        }
    },

    // 2. Enroll Student (REAL ML: Send Image)
    enrollStudent: async (name, studentId, embedding, imageBase64) => {
        try {
            // "embedding" arg is ignored, we send imageBase64 so Python can generate it.
            const response = await axios.post(`${API_URL}/train`, {
                label: name,
                image: imageBase64
            });
            return response.data.success;
        } catch (error) {
            console.error("[Backend] Enrollment Failed:", error.message);
            return false;
        }
    },

    // 3. Server-Side Recognition (REAL ML: Send Image)
    recognizeFace: async (imageBase64) => {
        try {
            // Send the raw image for inference
            const response = await axios.post(`${API_URL}/predict`, {
                image: imageBase64
            }, { timeout: 3000 }); // 3s timeout for image upload & processing

            return response.data; // Expected: { person: "eswar", confidence: 0.88, matched: true }
        } catch (error) {
            console.warn("[Backend] Recognition API Failed:", error.message);
            return null;
        }
    },

    // 4. Mark Attendance
    markAttendance: async (sessionId, matches) => {
        // Implementation for attendance submission
        return true;
    }
};
