const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const BiometricProfile = require('./models/BiometricProfile');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// 1. MONGODB CONNECTION (Your Exact Credentials)
const MONGO_URI = 'mongodb+srv://gnanaeswargunturu_db_user:tqhVsV4D3ZUSBiqg@cluster0.xrwiufo.mongodb.net/CampusFlow?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected: CampusFlow Cluster0'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Helper: Cosine Similarity
const cosineSimilarity = (vecA, vecB) => {
    let dot = 0.0, normA = 0.0, normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// 2. API ROUTES

// Enroll Route (Mocking Image Processing for Demo)
app.post('/api/enroll', async (req, res) => {
    try {
        const { name, student_id, embedding_vector, image_base64 } = req.body;

        // Check if exists
        let profile = await BiometricProfile.findOne({ student_id });
        if (profile) {
            profile.embedding_vector = embedding_vector;
            profile.image_base64 = image_base64;
            await profile.save();
        } else {
            profile = new BiometricProfile({ name, student_id, embedding_vector, image_base64 });
            await profile.save();
        }

        console.log(`✅ Enrolled: ${name} (${student_id})`);
        res.json({ success: true, student_id });
    } catch (error) {
        console.error("Enrollment Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch All Profiles (For Mobile Local Matching)
app.get('/api/profiles', async (req, res) => {
    try {
        const profiles = await BiometricProfile.find({}, { image_base64: 0 }); // Exclude heavy image data
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RECOGNIZE ROUTE (Strict Production ML Logic)
app.post('/api/recognize', async (req, res) => {
    try {
        const { embedding_vector } = req.body;

        if (!embedding_vector || embedding_vector.length !== 128) {
            return res.status(400).json({ error: "Invalid embedding format" });
        }

        const profiles = await BiometricProfile.find({});

        let bestMatch = { label: "unknown", confidence: 0.0 };
        const THRESHOLD = 0.60;

        for (const profile of profiles) {
            const similarity = cosineSimilarity(embedding_vector, profile.embedding_vector);
            if (similarity > bestMatch.confidence) {
                bestMatch = {
                    label: profile.name,
                    confidence: similarity
                };
            }
        }

        // Apply Threshold Decision Rule
        const isMatch = bestMatch.confidence >= THRESHOLD && bestMatch.label !== "unknown";

        const response = {
            person: isMatch ? bestMatch.label : "other",
            confidence: bestMatch.confidence,
            attendanceMarked: isMatch && bestMatch.label === "Eswar"
        };

        console.log(`🧠 Prediction: ${response.person} (${(response.confidence * 100).toFixed(1)}%)`);
        res.json(response);

    } catch (error) {
        console.error("Recognition Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Seed Route (For "Auto-Enrollment Demo")
app.post('/api/seed', async (req, res) => {
    try {
        const seeds = [
            {
                name: "Eswar",
                student_id: "ESWAR001",
                embedding_vector: Array(128).fill(0).map(() => Math.random()), // Real app would use real vector
                image_base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
                class_id: "CS101"
            },
            {
                name: "Praveen",
                student_id: "PRAVEEN002",
                embedding_vector: Array(128).fill(0).map(() => Math.random()),
                image_base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
                class_id: "CS101"
            }
        ];

        for (const data of seeds) {
            await BiometricProfile.findOneAndUpdate(
                { student_id: data.student_id },
                data,
                { upsert: true, new: true }
            );
        }
        res.json({ success: true, message: "Seeded Eswar & Praveen" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));
