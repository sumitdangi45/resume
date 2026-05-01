import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

print("Loading dataset (resume_dataset_200k.json)...")
with open("resume_dataset_200k.json", encoding="utf-8") as f:
    data = json.load(f)

X = []
y = []

for d in data:
    skills_req = len(d["skills_required"])
    skill_ratio = len(d["skills_present"]) / skills_req if skills_req > 0 else 0
    exp = d["experience_years"]
    project_count = len(d["projects"])

    edu_map = {"B.Tech CSE":3, "MCA":2, "BCA":1, "B.Sc IT":1}
    edu = edu_map.get(d["education"],1)

    resume_len = len(d["resume_text"])

    X.append([skill_ratio, exp, project_count, edu, resume_len])
    y.append(d["ats_score"])

X = np.array(X)
y = np.array(y)

print("Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training RandomForestRegressor (advanced)...")
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

print("Model trained successfully")
print("Accuracy:", model.score(X_test, y_test))

joblib.dump(model, "ats_model_advanced.pkl")
print("Model saved to ats_model_advanced.pkl")
