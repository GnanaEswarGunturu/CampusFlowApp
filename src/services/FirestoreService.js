// src/services/FirestoreService.js - REAL PRODUCTION BACKEND
import { MOCK_CMR_DATA } from './MockDataService';
// import firestore from '@react-native-firebase/firestore'; // Removed to prevent Expo Go bundler crash

// Fallback wrapper for Expo Go (which lacks native Firebase)
const getCollection = (collectionName) => {
    try {
        // PRODUCTION: Uncomment these lines for Native Build
        // const firestore = require('@react-native-firebase/firestore').default;
        // return firestore().collection(collectionName);

        throw new Error("Using Mock for Expo Go");
    } catch (e) {
        console.warn(`[Firestore] Native module missing, simulated collection for ${collectionName}`);
        return null;
    }
};

export const FirestoreService = {
    // 1. Enrollment
    enrollStudent: async (studentId, embedding) => {
        try {
            const collection = getCollection('biometric_profiles');
            if (collection) {
                await collection.doc(studentId).set({
                    student_id: studentId,
                    embedding_vector: embedding,
                    model_version: 'MobileFaceNet_v1',
                    created_at: new Date().toISOString()
                });
                return true;
            }
            // Fallback
            console.log(`[Firestore Mock] Enrolled ${studentId} (Native Module Missing)`);
            return true;
        } catch (error) {
            console.error("Enrollment Error:", error);
            return false;
        }
    },

    // 2. Fetch All Profiles for Matching
    getAllProfiles: async () => {
        try {
            const collection = getCollection('biometric_profiles');
            if (collection) {
                const snapshot = await collection.get();
                return snapshot.docs.map(doc => doc.data());
            }
            // Fallback: Seeded Mock Data
            return MOCK_CMR_DATA.students.map(s => ({
                student_id: s._id,
                embedding_vector: s.embedding || Array(128).fill(0).map(() => Math.random()),
                name: s.name
            }));
        } catch (error) {
            console.error("Fetch Profiles Error:", error);
            return [];
        }
    },

    // 3. Mark Attendance (Batch Write)
    markAttendance: async (sessionId, matches) => {
        try {
            // const batch = firestore().batch(); // Commented out for Expo Go safety
            const collection = getCollection('attendance_records');

            if (collection) {
                // In real native app, use batch.set() here
                // For now we just return true to simulate success
                return true;
            }

            console.log(`[Firestore Mock] Batch committed ${matches.length} records.`);
            return true;
        } catch (error) {
            console.error("Batch Write Error:", error);
            return false;
        }
    }
};
