from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

app = Flask(__name__)
CORS(app)

def train_model():
    df = pd.read_csv('project_risk_raw_dataset.csv')
    
    features = [
        'Project_Type', 'Team_Size', 'Estimated_Timeline_Months',
        'Complexity_Score', 'Methodology_Used', 'Team_Experience_Level',
        'Project_Budget_USD', 'Priority_Level', 'Project_Manager_Experience'
    ]
    
    df = df[features + ['Risk_Level']].dropna()
    
    encoders = {}
    categorical = ['Project_Type', 'Methodology_Used', 'Team_Experience_Level', 'Priority_Level', 'Project_Manager_Experience']
    
    for col in categorical:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
    
    target_encoder = LabelEncoder()
    df['Risk_Level'] = target_encoder.fit_transform(df['Risk_Level'])
    
    X = df[features]
    y = df['Risk_Level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    return model, encoders, target_encoder, features

print("Training Random Forest model...")
model, encoders, target_encoder, features = train_model()
print("Random Forest model trained successfully!")

def get_risk_reason(data, risk_level):
    reasons = []
    
    if data.get('Complexity_Score', 0) > 7:
        reasons.append("high complexity score")
    if data.get('Team_Size', 0) > 20:
        reasons.append("large team size increases coordination risk")
    if data.get('Estimated_Timeline_Months', 0) < 3:
        reasons.append("very tight timeline")
    if data.get('Team_Experience_Level') == 'Junior':
        reasons.append("junior team experience level")
    if data.get('Priority_Level') == 'Critical':
        reasons.append("critical priority level adds pressure")
    if data.get('Project_Budget_USD', 0) < 100000:
        reasons.append("low budget constraints")
    if data.get('Project_Manager_Experience') == 'Junior PM':
        reasons.append("junior project manager experience")

    if not reasons:
        if risk_level == 'Low':
            reasons.append("well balanced team, adequate budget and realistic timeline")
        elif risk_level == 'Medium':
            reasons.append("moderate project parameters with some areas to watch")
        else:
            reasons.append("combination of multiple risk factors detected")

    return f"Risk is {risk_level} due to: {', '.join(reasons)}."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        input_data = {
            'Project_Type': data['Project_Type'],
            'Team_Size': data['Team_Size'],
            'Estimated_Timeline_Months': data['Estimated_Timeline_Months'],
            'Complexity_Score': data['Complexity_Score'],
            'Methodology_Used': data['Methodology_Used'],
            'Team_Experience_Level': data['Team_Experience_Level'],
            'Project_Budget_USD': data['Project_Budget_USD'],
            'Priority_Level': data['Priority_Level'],
            'Project_Manager_Experience': data['Project_Manager_Experience'],
        }
        
        categorical = ['Project_Type', 'Methodology_Used', 'Team_Experience_Level', 'Priority_Level', 'Project_Manager_Experience']
        encoded = input_data.copy()
        
        for col in categorical:
            le = encoders[col]
            val = encoded[col]
            if val in le.classes_:
                encoded[col] = int(le.transform([val])[0])
            else:
                encoded[col] = 0
        
        input_df = pd.DataFrame([encoded])[features]
        prediction = model.predict(input_df)[0]
        risk_level = target_encoder.inverse_transform([prediction])[0]
        risk_reason = get_risk_reason(data, risk_level)
        
        return jsonify({
            'riskLevel': risk_level,
            'riskReason': risk_reason
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML server is running!'})

if __name__ == '__main__':
    app.run(port=8000, debug=True)