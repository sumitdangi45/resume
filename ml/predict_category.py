import sys
import json
import joblib
import re
import warnings
warnings.filterwarnings("ignore")

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

try:
    # Load model and vectorizer
    vectorizer = joblib.load("tfidf_vectorizer.pkl")
    model = joblib.load("category_model.pkl")

    # Read JSON from stdin
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    resume_text = data.get("resume_text", "")

    cleaned = clean_text(resume_text)
    
    if not cleaned:
        print(json.dumps({"category": "Unknown"}))
        sys.exit(0)

    vec = vectorizer.transform([cleaned])
    prediction = model.predict(vec)[0]

    result = {
        "category": str(prediction)
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
