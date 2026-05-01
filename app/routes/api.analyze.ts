import { type ActionFunctionArgs, data } from "react-router";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const action = async ({ request }: ActionFunctionArgs) => {
    if (request.method !== "POST") {
        return data({ message: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const { skills_present = [], skills_required = [], experience = 0, projects = [], education = "B.Tech CSE", resume_text = "" } = body;

        // Missing skills calculation can stay in JS
        const missing = skills_required.filter((s: string) => !skills_present.includes(s));

        const pythonScript = path.resolve(process.cwd(), "ml", "predict.py");
        
        // Execute Python script and pass data via stdin
        const child = exec(`python "${pythonScript}"`);
        
        let stdoutData = "";
        let stderrData = "";

        const predictionPromise = new Promise((resolve, reject) => {
            child.stdout?.on('data', (data) => {
                stdoutData += data;
            });
            child.stderr?.on('data', (data) => {
                stderrData += data;
            });
            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${stderrData}`));
                } else {
                    try {
                        resolve(JSON.parse(stdoutData.trim()));
                    } catch (e) {
                        reject(new Error(`Failed to parse Python output: ${stdoutData}`));
                    }
                }
            });
            child.on('error', reject);
        });

        // Write to stdin
        if (child.stdin) {
            child.stdin.write(JSON.stringify({
                skills_present,
                skills_required,
                experience_years: experience,
                projects,
                education,
                resume_text
            }));
            child.stdin.end();
        }

        const pythonResult: any = await predictionPromise;

        if (pythonResult.error) {
            console.error("Python Error:", pythonResult.error);
            return data({ message: "ML Model Error" }, { status: 500 });
        }

        return data({
            ats_score: pythonResult.ats_score,
            missing_skills: missing
        });
    } catch (error: any) {
        console.error("API Analyze Error:", error);
        return data({ message: error.message || "Invalid request payload" }, { status: 400 });
    }
};
