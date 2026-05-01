import random
import json

skills_pool = [
    "HTML", "CSS", "JavaScript", "React", "Node.js",
    "MongoDB", "MySQL", "Python", "Java", "C++",
    "Data Structures", "Algorithms", "Git", "REST API",
    "Machine Learning", "Deep Learning", "UI/UX", "TypeScript"
]

job_roles = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Machine Learning Engineer", "Software Engineer"
]

projects_pool = [
    "E-commerce Website", "Chat Application", "Portfolio Website",
    "AI Chatbot", "Weather App", "Fraud Detection System"
]

education_pool = [
    "B.Tech CSE", "BCA", "MCA", "B.Sc IT"
]

dataset = []

for i in range(200000):
    role = random.choice(job_roles)

    required_skills = random.sample(skills_pool, random.randint(4,6))
    present_skills = random.sample(required_skills, random.randint(2,len(required_skills)))

    missing_skills = list(set(required_skills) - set(present_skills))

    experience = random.randint(0,5)

    # NEW SMART ATS LOGIC
    skill_score = len(present_skills) / len(required_skills)
    experience_weight = min(experience / 5, 1)
    ats_score = int((0.7 * skill_score + 0.3 * experience_weight) * 100)

    resume_text = f"Candidate skilled in {', '.join(present_skills)} with {experience} years experience."

    data = {
        "id": i+1,
        "job_role": role,
        "resume_text": resume_text,
        "skills_present": present_skills,
        "skills_required": required_skills,
        "missing_skills": missing_skills,
        "experience_years": experience,
        "projects": random.sample(projects_pool, random.randint(1,2)),
        "education": random.choice(education_pool),
        "ats_score": ats_score
    }

    dataset.append(data)

with open("resume_dataset_200k.json", "w") as f:
    json.dump(dataset, f, indent=2)

print("✅ 200,000 dataset generated successfully!")
