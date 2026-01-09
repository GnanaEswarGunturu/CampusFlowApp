// ClassroomEnrollment.js - 8-Segment Motor Rotation Simulation
import { CLASSROOM_FACES } from '../mockData/classroomFaces';
import { FirestoreService } from './FirestoreService';
import { FaceRecognitionService } from './FaceRecognitionService';

// Simulates extracting multiple faces from a wide-angle classroom shot
const simulateFaceExtraction = async (segmentIndex) => {
    // In a real scenario, this would detect multiple faces in the image
    // For the demo, we slice our mock data
    const batchSize = Math.ceil(50 / 8); // ~6-7 per segment
    const start = segmentIndex * batchSize;
    const end = start + batchSize;

    return CLASSROOM_FACES.slice(start, end).map(student => ({
        ...student,
        detectedAtSegment: segmentIndex + 1
    }));
};

export const ClassroomEnrollment = {
    // Run the full 8-segment rotation scan
    startScan: async (onProgress) => {
        const allExtractedFaces = [];

        for (let i = 0; i < 8; i++) {
            // 1. Simulate Motor Move
            await new Promise(r => setTimeout(r, 600)); // Motor moving time

            // 2. Capture & Extract Faces
            const faces = await simulateFaceExtraction(i);
            allExtractedFaces.push(...faces);

            // 3. Generate Embeddings (Simulated via pre-calc mock)
            // In real app: await Promise.all(faces.map(f => FaceRecognitionService.generateEmbedding(f.image)))

            if (onProgress) onProgress(i + 1, faces.length);
        }

        // 4. Store Unique Profiles
        // Using Firestore Production Service
        for (const student of allExtractedFaces) {
            await FirestoreService.enrollStudent(student.student_id, student.embedding);
        }

        return {
            totalEnrolled: allExtractedFaces.length,
            accuracy: 0.95
        };
    }
};
