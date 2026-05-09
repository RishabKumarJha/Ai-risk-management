# AI-Powered Smart Risk Prediction

A full-stack web application that predicts software project risk levels using Machine Learning.

## Tech Stack
- **Frontend:** Next.js
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **ML Server:** Python + Flask + Random Forest (87.81% accuracy)

## How to Run

### 1. Start MongoDB
```bash
mongod --dbpath "C:\data\db"
```

### 2. Start Backend
```bash
cd backend
node app.js
```

### 3. Start ML Server
```bash
cd ml-server
python app.py
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

### 5. Open Browser
```
http://localhost:3000
```

## Features
- User Authentication (Signup/Login)
- Project Dashboard with search
- AI Risk Prediction (Low/Medium/High/Critical)
- Risk Reason Explanation
- Create, View, Edit, Delete projects

## ML Model
- Algorithm: Random Forest Classifier
- Dataset: 8,000 project records
- Features: 9 input parameters
- Accuracy: 87.81%