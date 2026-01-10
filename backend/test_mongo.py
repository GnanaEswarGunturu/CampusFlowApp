from pymongo import MongoClient
import datetime
import sys

# URI from app.py
MONGO_URI = "mongodb+srv://gnanaeswar:0nSGrGOnKLVrCrac@cluster0.xrwiufo.mongodb.net/CampusFlow?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "CampusFlow"

try:
    print(f"⏳ Connecting to {DB_NAME}...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info() # Trigger connection
    
    db = client[DB_NAME]
    collection = db["attendance"]
    
    # Create Test Document
    test_doc = {
        "personId": "TEST_USER_001",
        "name": "Test User",
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "confidence": 1.0,
        "status": "Present",
        "source": "Manual Test Script",
        "timestamp": datetime.datetime.now()
    }
    
    print("📤 Attempting to insert test record...")
    result = collection.insert_one(test_doc)
    
    print(f"✅ SUCCESS! Data written to MongoDB Cloud.")
    print(f"   Document ID: {result.inserted_id}")
    print("   Go check your MongoDB Atlas Dashboard now!")

except Exception as e:
    print(f"\n❌ FAILED to write to MongoDB.")
    print(f"   Error: {e}")
    print("   Common causes: IP Whitelist, Wrong Password, No Internet.")
