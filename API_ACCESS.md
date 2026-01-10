# Backend API Access Guide

The data is stored in **MongoDB Atlas** (Cloud). You can access it in two ways:

## 1. Direct MongoDB Access (Recommended for New Website)
Since the data is in the cloud, your new website can connect **directly** to MongoDB, just like this app does. you do not need to go through the Laptop's Python Server.

**Connection String:**
`mongodb+srv://gnanaeswar:0nSGrGOnKLVrCrac@cluster0.xrwiufo.mongodb.net/CampusFlow?retryWrites=true&w=majority&appName=Cluster0`

**Collection:** `attendance` inside `CampusFlow` database.

---

## 2. Using the Python API (Local Network Only)
If you want to fetch data via the Python backend, you must be on the **same WiFi network**.

**Base URL:**
`http://172.16.1.75:5000`

**Endpoints:**
- **GET All Attendance:**
  `GET http://172.16.1.75:5000/api/attendance`
  
- **GET By Date:**
  `GET http://172.16.1.75:5000/api/attendance?date=2026-01-10`

- **GET By Student:**
  `GET http://172.16.1.75:5000/api/attendance?studentId=CSE2026_045`

> **Note:** Since this is running on your laptop, your new website will only be able to reach this URL if it is also running on your laptop or the same WiFi.
