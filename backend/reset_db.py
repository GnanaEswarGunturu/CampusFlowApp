from pymongo import MongoClient

MONGO_URI = "mongodb+srv://gnanaeswar:0nSGrGOnKLVrCrac@cluster0.xrwiufo.mongodb.net/CampusFlow?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "CampusFlow"

print("⏳ Connecting to MongoDB...")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["attendance"]

count_before = collection.count_documents({})
print(f"🧐 Found {count_before} records.")

print("🗑️ Deleting ALL records...")
result = collection.delete_many({})

print(f"✅ Deleted {result.deleted_count} records.")
print("✨ Database is now CLEAN.")
