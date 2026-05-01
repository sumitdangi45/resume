import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import re

print("Loading dataset (Resume.csv)...")
try:
    df = pd.read_csv("Resume.csv")
except Exception as e:
    print("Could not read Resume.csv:", e)
    exit(1)

# Drop rows where Resume_str is NaN
df = df.dropna(subset=['Resume_str'])

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("Cleaning resume text data...")
# Sample to 20000 for faster training if needed, or use all
# df = df.sample(20000, random_state=42) 
df['Cleaned_Resume'] = df['Resume_str'].apply(clean_text)

X = df['Cleaned_Resume']
y = df['Category']

print("Vectorizing text using TF-IDF...")
vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
X_vec = vectorizer.fit_transform(X)

print("Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)

print("Training Logistic Regression classifier...")
model = LogisticRegression(max_iter=1000, n_jobs=-1)
model.fit(X_train, y_train)

print("Model trained successfully!")
print("Accuracy:", model.score(X_test, y_test))

# Save the vectorizer and the model
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")
joblib.dump(model, "category_model.pkl")
print("Saved vectorizer and model successfully!")
