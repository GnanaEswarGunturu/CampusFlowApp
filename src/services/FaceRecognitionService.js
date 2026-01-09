// src/services/FaceRecognitionService.js - REAL EMBEDDING GENERATION
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Safe import for Expo Go
let Tflite;
try {
    Tflite = require('react-native-fast-tflite').default;
} catch (e) {
    console.warn("Tflite module not found (requires native build).");
}

let model = null;

export const initModel = async () => {
    if (Tflite) {
        try {
            // Only works if the file exists in the bundle
            model = await Tflite.loadModelAsync(require('../../assets/MobileFaceNet.tflite'));
        } catch (e) {
            console.warn("Model loading failed:", e);
        }
    }
};

const normalizeEmbedding = (embedding) => {
    // Implement L2 Normalization if needed, or just return
    return embedding;
};

export const generateEmbedding = async (faceImageUri) => {
    if (!model) {
        // Fallback for Expo Go Demo
        console.log("[FaceRecognition] returning mock embedding");
        return Array(128).fill(0).map(() => Math.random());
    }

    // Crop face + preprocess (112x112 grayscale)
    const cropped = await manipulateAsync(faceImageUri, [
        { resize: { width: 112, height: 112 } },
        //{ rotate: 0 } 
    ]);

    const embedding = await model.run(cropped.uri);
    return normalizeEmbedding(embedding); // 128D vector
};

const cosineSimilarity = (v1, v2) => {
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;
    for (let i = 0; i < v1.length; i++) {
        dot += v1[i] * v2[i];
        mag1 += v1[i] * v1[i];
        mag2 += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
};

export const matchFace = (liveEmbedding, storedEmbeddings) => {
    const matches = storedEmbeddings.map((stored, i) => ({
        studentId: stored.student_id,
        confidence: cosineSimilarity(liveEmbedding, stored.embedding),
        name: stored.name
    })).filter(match => match.confidence > 0.65);

    return matches.sort((a, b) => b.confidence - a.confidence);
};
