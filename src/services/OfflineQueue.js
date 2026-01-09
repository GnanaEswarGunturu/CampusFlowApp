// OfflineQueue.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@campusflow_attendance_queue';

export const OfflineQueue = {
    async enqueue(attendanceData) {
        try {
            const existing = await this.getQueue();
            const updated = [...existing, { ...attendanceData, timestamp: Date.now() }];
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
            return true;
        } catch (e) {
            console.error("Queue Failed", e);
            return false;
        }
    },

    async getQueue() {
        const data = await AsyncStorage.getItem(QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    },

    async clear() {
        await AsyncStorage.removeItem(QUEUE_KEY);
    }
};
