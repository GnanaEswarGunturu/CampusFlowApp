// src/services/LiveAttendanceMatching.js - Back Camera Real-Time Matching WITH MONGODB
import { FaceRecognitionService } from './FaceRecognitionService';
import { MongoDBService } from './MongoDBService';
import { detectLiveFaces } from './FaceDetectionService';

export const LiveAttendanceMatching = {
    scanFrame: async (imageBase64) => {
        // REAL ML: We receive the image directly from the camera snapshot
        const recognizedFaces = [];

        try {
            const prediction = await MongoDBService.recognizeFace(imageBase64);

            if (!prediction) return [];

            if (prediction.status === 'no_face') {
                recognizedFaces.push({
                    id: 'NO_FACE',
                    name: 'No Face Detected',
                    confidence: 0,
                    isWarning: true
                });
            }
            else if (prediction.status === 'unknown') {
                recognizedFaces.push({
                    id: 'UNKNOWN',
                    name: 'Unknown Face',
                    confidence: prediction.confidence
                });
            }
            else if (prediction.status === 'match' && prediction.person === 'eswar') {
                recognizedFaces.push({
                    id: 'ESWAR001',
                    name: 'Eswar',
                    confidence: prediction.confidence
                });
            }
            else {
                recognizedFaces.push({ name: "Unknown", id: "UNKNOWN", confidence: 0 });
            }

        } catch (error) {
            console.warn("Scan processing error:", error);
        }

        return recognizedFaces;
    }
};
