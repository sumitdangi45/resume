import sys
import json
import joblib
import warnings
warnings.filterwarnings("ignore")

try:
    # Load model
    model = joblib.load("ats_model_advanced.pkl")

    # Read JSON from stdin
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    skills_present = data.get("skills_present", [])
    skills_required = data.get("skills_required", [])
    exp = data.get("experience_years", 0)
    projects = data.get("projects", [])
    education = data.get("education", "B.Tech CSE")
    resume_text = data.get("resume_text", "")

    skills_req_len = len(skills_required)
    skill_ratio = len(skills_present) / skills_req_len if skills_req_len > 0 else 0
    project_count = len(projects)

    edu_map = {"B.Tech CSE":3, "MCA":2, "BCA":1, "B.Sc IT":1}
    edu = edu_map.get(education,1)

    resume_len = len(resume_text)

    features = [[skill_ratio, exp, project_count, edu, resume_len]]

    score = model.predict(features)[0]

    result = {
        "ats_score": int(score)
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
