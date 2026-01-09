// src/services/LiveAttendanceMatching.js - Back Camera Real-Time Matching WITH MONGODB
import { FaceRecognitionService } from './FaceRecognitionService';
import { MongoDBService } from './MongoDBService';
import { detectLiveFaces } from './FaceDetectionService';

export const LiveAttendanceMatching = {
    scanFrame: async (imageBase64) => {
        // REAL ML: We receive the image directly from the camera snapshot
        const recognizedFaces = [];

        try {
            // Send Image to Backend for Detection + Recognition
            // Pass the base64 string directly.
            const prediction = await MongoDBService.recognizeFace(imageBase64);

            if (prediction && prediction.matched) {
                recognizedFaces.push({
                    id: prediction.person === 'eswar' ? 'ESWAR001' : 'UNKNOWN',
                    name: prediction.person === 'eswar' ? 'Eswar' : 'Other',
                    confidence: prediction.confidence
                });
            } else if (prediction && !prediction.matched) {
                recognizedFaces.push({
                    id: 'UNKNOWN',
                    name: 'Other / Unknown',
                    confidence: prediction.confidence || 0.0
                });
            } else {
                // Fallback Removed: Real ML or Nothing.
                console.log("[Attendance] Server returned no match or error.");
            }
        } catch (error) {
            console.warn("Scan processing error:", error);
        }

        return recognizedFaces;
    }
};
