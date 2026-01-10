from pymongo import MongoClient
import sys

# URI from app.py
MONGO_URI = "mongodb+srv://gnanaeswar:0nSGrGOnKLVrCrac@cluster0.xrwiufo.mongodb.net/CampusFlow?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "CampusFlow"

try:
    print(f"⏳ Reading 5 latest records from {DB_NAME}...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    collection = db["attendance"]
    
    # Get last 5, sorted by latest
    cursor = collection.find({}).sort("timestamp", -1).limit(5)
    records = list(cursor)
    
    if not records:
        print("❌ No records found in 'attendance' collection.")
    else:
        print(f"✅ Found {len(records)} recent records:")
        for doc in records:
            # Clean print
            print("------------------------------------------------")
            print(f"Name:   {doc.get('name')}")
            print(f"Status: {doc.get('status')}")
            print(f"Time:   {doc.get('date')} {doc.get('time')}")
            print(f"Conf:   {doc.get('confidence')}")
            print(f"ID:     {doc.get('_id')}")

except Exception as e:
    print(f"❌ Error reading DB: {e}")
