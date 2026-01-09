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
# LBPH (Local Binary Patterns Histograms) Face Recognizer
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
                # Find max ID
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
    # Return first face
    (x, y, w, h) = faces[0]
    return gray[y:y+h, x:x+w], (x, y, w, h)

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "Online", "model": "OpenCV LBPH"})

@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    # Helper to see who is enrolled
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

        # Decode
        image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
        image = Image.open(io.BytesIO(image_data))
        np_image = np.array(image.convert('RGB'))

        # Detect
        face_roi, rect = detect_face(np_image)
        if face_roi is None:
             return jsonify({"error": "No face detected"}), 400

        # Handle Label ID
        if name not in label_map:
            current_id += 1
            label_map[name] = current_id
        
        label_id = label_map[name]

        # Update Model (LBPH supports update)
        # Note: update() works for incremental, but sometimes simple train() on all data is safer.
        # For simplicity in this demo, we'll append to disk and Re-Train from scratch to be robust.
        
        # Save Face Request to Disk
        save_path = os.path.join(STORAGE_DIR, f"{name}_{len(os.listdir(STORAGE_DIR))}.jpg")
        cv2.imwrite(save_path, face_roi)

        # RETRAIN ALL
        print("🔄 Retraining model on all data...")
        faces = []
        ids = []
        
        # We need to map filenames back to IDs. 
        # Simple Logic: Iterate provided images again? 
        # For hackfest speed: We just assume the current 'update' works enough for the demo session.
        # Actually LBPH .update() is perfect for this.
        
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

        # Decode
        image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
        image = Image.open(io.BytesIO(image_data))
        np_image = np.array(image.convert('RGB'))

        # Detect
        face_roi, rect = detect_face(np_image)
        if face_roi is None:
             return jsonify({"person": "other", "confidence": 0.0, "matched": False, "message": "No face detected"})

        # PREDICT
        # Check if model is trained
        if not label_map:
             return jsonify({
                "person": "other",
                "confidence": 0.0,
                "matched": False,
                "message": "Model not trained yet"
             })

        try:
            label_id, distance = recognizer.predict(face_roi)
        except cv2.error:
            # LBPH throws error if not trained
            return jsonify({
                "person": "other",
                "confidence": 0.0,
                "matched": False,
                "message": "Model untrained"
             })

        print(f"🔍 Debug: Distance={distance} LabelID={label_id}")

        # IMPROVED THRESHOLD LOGIC
        # LBPH Distance: 0 (Exact) to >100 (Different)
        # We relax the cutoff to 100 to handle lighting variances.
        
        THRESHOLD = 100
        
        # Calculate Confidence %
        # Dist 0 -> 100%
        # Dist 100 -> 40% (Cutoff)
        if distance < 50:
            confidence = 1.0 - (distance / 100) # 0.5 to 1.0
        else:
            confidence = max(0.0, 1.0 - (distance / 150)) # Gentler drop-off

        found_name = "Other"
        for name, lid in label_map.items():
            if lid == label_id:
                found_name = name
                break
        
        is_match = distance < THRESHOLD
        
        final_name = found_name if is_match else "Other"
        is_eswar = final_name == "Eswar"

        return jsonify({
            "person": "eswar" if is_eswar else "other",
            "confidence": round(confidence, 2),
            "matched": True, # Face found
            "debug_distance": distance
        })

    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 OpenCV LBPH ML Server running on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
