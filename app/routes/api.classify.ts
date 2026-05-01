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
        const { resume_text = "" } = body;

        const pythonScript = path.resolve(process.cwd(), "ml", "predict_category.py");
        
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
            child.stdin.write(JSON.stringify({ resume_text }));
            child.stdin.end();
        }

        const pythonResult: any = await predictionPromise;

        if (pythonResult.error) {
            console.error("Python Error:", pythonResult.error);
            return data({ message: "ML Model Error" }, { status: 500 });
        }

        return data({
            category: pythonResult.category
        });
    } catch (error: any) {
        console.error("API Classify Error:", error);
        return data({ message: error.message || "Invalid request payload" }, { status: 400 });
    }
};
