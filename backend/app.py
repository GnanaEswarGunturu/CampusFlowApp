from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import os
import shutil

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
STORAGE_DIR = "training_data"
MODEL_FILE = "trainer.yml"
LABELS_FILE = "labels.npy"

if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

# Initialize Authenticator
recognizer = cv2.face.LBPHFaceRecognizer_create()
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Global State
label_map = {} # { "Eswar": 1, "Other": 2 }
current_id = 0

def load_model():
    global label_map, current_id, recognizer
    try:
        if os.path.exists(MODEL_FILE):
            recognizer.read(MODEL_FILE)
            if os.path.exists(LABELS_FILE):
                label_map = np.load(LABELS_FILE, allow_pickle=True).item()
                if label_map:
                    current_id = max(label_map.values())
            print("✅ Model Loaded")
        else:
            print("⚠️ No model found, training required.")
    except Exception as e:
        print(f"⚠️ Model load failed: {e}")

load_model()

def detect_face(np_image):
    gray = cv2.cvtColor(np_image, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        return None, None
    (x, y, w, h) = faces[0]
    return gray[y:y+h, x:x+w], (x, y, w, h)

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "Online", "model": "OpenCV LBPH"})

@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    return jsonify([{ "name": name, "id": idx } for name, idx in label_map.items()])

@app.route('/api/train', methods=['POST'])
def train():
    global current_id, label_map, recognizer
    try:
        data = request.json
        name = data.get('label', 'Unknown')
        image_base64 = data.get('image')

        if not image_base64:
            return jsonify({"error": "Missing image"}), 400

        image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
        image = Image.open(io.BytesIO(image_data))
        np_image = np.array(image.convert('RGB'))

        face_roi, rect = detect_face(np_image)
        if face_roi is None:
             return jsonify({"error": "No face detected"}), 400

        if name not in label_map:
            current_id += 1
            label_map[name] = current_id
        
        label_id = label_map[name]
        
        save_path = os.path.join(STORAGE_DIR, f"{name}_{len(os.listdir(STORAGE_DIR))}.jpg")
        cv2.imwrite(save_path, face_roi)

        print("🔄 Retraining model on all data...")
        recognizer.update([face_roi], np.array([label_id]))
        recognizer.write(MODEL_FILE)
        np.save(LABELS_FILE, label_map)

        print(f"✅ Trained: {name} (ID: {label_id})")
        return jsonify({"success": True, "message": f"Trained {name}"})

    except Exception as e:
        print(f"❌ Training Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        image_base64 = data.get('image')

        if not image_base64:
            return jsonify({"error": "Missing image"}), 400

        image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
        image = Image.open(io.BytesIO(image_data))
        np_image = np.array(image.convert('RGB'))

        face_roi, rect = detect_face(np_image)
        if face_roi is None:
             return jsonify({"status": "no_face", "person": "none", "confidence": 0.0})

        if not label_map:
             return jsonify({"status": "error", "message": "Model not trained"})

        try:
            label_id, distance = recognizer.predict(face_roi)
            print(f"🔍 Debug: Distance={distance} LabelID={label_id}")
        except cv2.error:
            return jsonify({"status": "error", "message": "Model untrained"})

        THRESHOLD = 100
        
        if distance < 50:
            confidence = 1.0 - (distance / 100)
        else:
            confidence = max(0.0, 1.0 - (distance / 150))

        found_name = "Other"
        for name, lid in label_map.items():
            if lid == label_id:
                found_name = name
                break
        
        is_match = distance < THRESHOLD
        final_name = found_name if is_match else "Other"
        
        # Robust check: case-insensitive "eswar"
        is_eswar = final_name.lower().strip() == "eswar"

        if not is_match:
            return jsonify({
                "status": "unknown",
                "person": "other",
                "confidence": round(confidence, 2),
                "distance": distance
            })
        
        return jsonify({
            "status": "match",
            "person": "eswar" if is_eswar else "other",
            "confidence": round(confidence, 2),
            "distance": distance
        })

    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 OpenCV LBPH ML Server running on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
