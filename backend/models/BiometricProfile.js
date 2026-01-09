const mongoose = require('mongoose');

const biometricSchema = new mongoose.Schema({
    name: { type: String, required: true },      // "eswar", "praveen"
    student_id: { type: String, required: true }, // "ESWAR001", "PRAVEEN002"
    embedding_vector: { type: [Number], required: true }, // 128D MobileFaceNet
    image_base64: { type: String, required: true },       // Base64 image
    class_id: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BiometricProfile', biometricSchema);
