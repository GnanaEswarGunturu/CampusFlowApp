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

        # TUNING: Lower distance = better match.
        # < 50: Excellent, 50-90: Good/Okay, > 90: Unknown
        THRESHOLD = 90.0
        
        # Simple Linear Confidence: 0 (Dist 100) to 1.0 (Dist 0)
        confidence = float(max(0.0, (100.0 - distance) / 100.0))

        found_name = "Other"
        for name, lid in label_map.items():
            if lid == label_id:
                found_name = name
                break
        
        print(f"🧐 Analysis: Found='{found_name}' Dist={distance} (Threshold={THRESHOLD})")

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
            "person": final_name, # Return actual name (e.g. "Praveen", "Eswar")
            "confidence": round(confidence, 2),
            "distance": distance
        })

    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

from pymongo import MongoClient, errors
import datetime
import sys

# --- MONGODB CONFIGURATION ---
# Using Cloud MongoDB Atlas provided by user
MONGO_URI = "mongodb+srv://gnanaeswar:0nSGrGOnKLVrCrac@cluster0.xrwiufo.mongodb.net/CampusFlow?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "CampusFlow"

try:
    # Increased timeout for cloud connection
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    # Trigger connection to fail fast if down
    client.server_info()
    db = client[DB_NAME]
    attendance_col = db["attendance"]
    
    # --- SCHEMA ENFORCEMENT ---
    # prevent duplicate attendance for the same student on the same day
    # Note: If reusing an existing collection, you may need to drop the old index manually in Atlas
    # db.attendance.drop_index("studentId_1_date_1")
    attendance_col.create_index([("personId", 1), ("date", 1)], unique=True)
    
    print(f"✅ Connected to MongoDB: {DB_NAME}")
    print("   Collection: attendance")
    
except errors.OperationFailure as e:
    print("\n❌ AUTHENTICATION FAILED: Check Username/Password")
    print(f"   Error Details: {e}")
    print("   Make sure your IP Address is whitelisted in MongoDB Atlas.\n")
    db = None
except errors.ConfigurationError as e:
    print("\n❌ NETWORK/DNS ERROR: Could not connect to Atlas.")
    print("   Your network is blocking the DNS lookup (common in Colleges/Offices).")
    print("   👉 TRY THIS: Connect to a Mobile Hotspot instead of WiFi.\n")
    db = None
except errors.ServerSelectionTimeoutError:
    print("\n❌ CONNECTION FAILED: MongoDB Reachability Error")
    print("   Check your internet connection or Atlas IP Whitelist.\n")
    db = None

# --- STUDENT DATABASE ---
# Maps the ML Label (e.g. "Eswar") to the official Student ID
STUDENT_DB = {
    "eswar": { "id": "CSE2026_045", "name": "Eswar" },
    "praveen": { "id": "CSE2026_046", "name": "Praveen" },
    "unknown": { "id": "UNKNOWN_000", "name": "Unknown Visitor" },
    "unknown face": { "id": "UNKNOWN_000", "name": "Unknown Visitor" },
    "other": { "id": "UNKNOWN_000", "name": "Unknown Visitor" }
}

@app.route('/api/mark-attendance', methods=['POST'])
def mark_attendance():
    print("🔔 MARK ATTENDANCE ENDPOINT HIT! Processing request...")
    if db is None:
        return jsonify({"error": "MongoDB Service Unavailable"}), 503

    try:
        data = request.json
        print(f"📥 Received Attendance Data: {data}")
        # Expected: { "person": "eswar", "confidence": 0.91 }
        
        person_label = data.get('person', '').lower()
        confidence = float(data.get('confidence', 0.0))

        # 1. Validate Mapping (One-to-One)
        student = STUDENT_DB.get(person_label)
        if not student:
            print(f"⚠️ Validation Failed: Unknown Person ({person_label})")
            return jsonify({"error": "Student not found in mapping"}), 404

        # 2. Minimum Threshold (>= 0.0) -> User Request: "Any confidence > 0"
        # We rely on the ML 'predict' function to filter bad matches via Distance THRESHOLD.
        # If it reaches here with a valid name, we accept it.
        if confidence <= 0.0: 
             print(f"⚠️ Validation Failed: Zero Confidence ({confidence})")
             return jsonify({"error": "Confidence must be > 0"}), 400

        # 3. Construct Document (Strict Schema)
        now = datetime.datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")

        doc = {
            "personId": student["id"],      # CHANGED from studentId
            "name": student["name"],        # CHANGED from studentName
            "date": date_str,
            "time": time_str,
            "confidence": confidence,
            "status": "Present",
            "source": "FaceRecognition",    # CHANGED from recognizedBy
            "createdAt": now
        }

        # 4. Insert into MongoDB (Atomic)
        try:
            attendance_col.insert_one(doc)
            print(f"✅ Attendance Marked: {student['name']}")
            return jsonify({
                "message": "Attendance marked successfully",
                "date": date_str,
                "time": time_str,
                "confidence": confidence
            })
        except errors.DuplicateKeyError:
            print(f"⚠️ Duplicate ignored: {student['name']}")
            return jsonify({
                "message": "Attendance already marked for today",
                "date": date_str
            })

    except Exception as e:
        print(f"❌ API Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    if db is None:
        return jsonify([])

    try:
        # Filters: ?date=2026-01-09&studentId=CSE2026_045
        date_filter = request.args.get('date')
        student_id = request.args.get('studentId')

        query = {}
        if date_filter:
            query["date"] = date_filter
        if student_id:
            query["studentId"] = student_id

        # Execute Query
        # Exclude _id (ObjectId) as it's not JSON serializable by default
        cursor = attendance_col.find(query, {"_id": 0}).sort("time", -1)
        records = list(cursor)
        
        return jsonify(records)
    except Exception as e:
         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 OpenCV LBPH ML Server running on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
