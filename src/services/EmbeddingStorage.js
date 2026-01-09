// EmbeddingStorage.js - Secure Biometric Storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CMR_DATA } from './MockDataService';

const STORAGE_KEY = 'biometric_profiles_v1';

export const EmbeddingStorage = {
    // Initialize with 50 mock students if empty
    init: async () => {
        try {
            const existing = await AsyncStorage.getItem(STORAGE_KEY);
            if (!existing) {
                console.log("[EmbeddingStorage] Seeding 50 mock biometric profiles...");
                const profiles = MOCK_CMR_DATA.students.map(s => ({
                    student_id: s._id,
                    name: s.name,
                    embedding: s.embedding || Array(128).fill(0).map(() => Math.random()), // Mock vectors
                    created_at: new Date().toISOString()
                }));
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
                return profiles;
            }
            return JSON.parse(existing);
        } catch (error) {
            console.error("[EmbeddingStorage] Init Error:", error);
            // Fallback to in-memory mock if storage fails
            return MOCK_CMR_DATA.students.map(s => ({
                student_id: s._id,
                name: s.name,
                embedding: Array(128).fill(0).map(() => Math.random()),
                created_at: new Date().toISOString()
            }));
        }
    },

    getAllProfiles: async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("[EmbeddingStorage] Get Error:", error);
            return [];
        }
    },

    addProfile: async (studentId, name, embedding) => {
        try {
            const profiles = await EmbeddingStorage.getAllProfiles();
            const newProfile = {
                student_id: studentId,
                name,
                embedding,
                created_at: new Date().toISOString()
            };
            profiles.push(newProfile);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
            console.log(`[EmbeddingStorage] Added profile for ${name}`);
            return true;
        } catch (error) {
            console.error("[EmbeddingStorage] Add Error:", error);
            return false;
        }
    }
};
