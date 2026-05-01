import { create } from "zustand";

// List of common skills to extract from resume
const COMMON_SKILLS = [
  // Programming Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Kotlin', 'Swift',
  
  // Frontend
  'React', 'React.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
  
  // Backend
  'Node.js', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Laravel', 'ASP.NET',
  
  // Databases
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'Firebase', 'Redis', 'Elasticsearch', 'DynamoDB',
  
  // DevOps & Cloud
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Vercel', 'Render', 'Heroku', 'Jenkins', 'CI/CD',
  
  // Tools & Technologies
  'Git', 'Github', 'GitLab', 'REST APIs', 'GraphQL', 'JWT', 'Redux', 'Redux Toolkit', 'Webpack', 'Vite', 'Jest', 'Cypress',
  
  // Data Science & AI
  'AIML', 'Machine Learning', 'Data Analysis', 'Excel', 'Power BI', 'Tableau', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow',
  
  // UI/UX
  'Figma', 'Canva', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
  
  // Other
  'React Native', 'Mobile Development', 'Web Development', 'Full Stack', 'Agile', 'Scrum'
];

// Function to extract skills from resume text
const extractSkillsFromResume = (resumeText: string): string[] => {
  if (!resumeText) return [];
  
  const extractedSkills: Set<string> = new Set();
  const lowerText = resumeText.toLowerCase();
  
  // Search for each skill in the resume text
  COMMON_SKILLS.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (lowerText.includes(skillLower)) {
      extractedSkills.add(skill);
    }
  });
  
  // Convert set to array and return
  return Array.from(extractedSkills).sort();
};

interface StorageStore {
    isLoading: boolean;
    error: string | null;
    
    // KV Store (using localStorage)
    kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[] | any[]>;
        flush: () => Promise<boolean>;
    };
    
    // File Store (using IndexedDB)
    fs: {
        upload: (files: File[] | Blob[]) => Promise<{ path: string; name: string } | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        delete: (path: string) => Promise<void>;
    };
    
    // AI Mock (for testing without Puter)
    ai: {
        feedback: (path: string, message: string) => Promise<any>;
        img2txt: (image: string | File | Blob) => Promise<string>;
    };
    
    init: () => void;
    clearError: () => void;
}

// IndexedDB helper for file storage
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ResumeAnalyzerDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'path' });
            }
        };
    });
};

export const useStorageStore = create<StorageStore>((set, get) => {
    const setError = (msg: string) => {
        set({ error: msg, isLoading: false });
    };

    // KV Store implementation using localStorage
    const getKV = async (key: string): Promise<string | null> => {
        try {
            return localStorage.getItem(key);
        } catch (err) {
            console.error('Error getting KV:', err);
            return null;
        }
    };

    const setKV = async (key: string, value: string): Promise<boolean> => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (err) {
            console.error('Error setting KV:', err);
            return false;
        }
    };

    const deleteKV = async (key: string): Promise<boolean> => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('Error deleting KV:', err);
            return false;
        }
    };

    const listKV = async (pattern: string, returnValues?: boolean): Promise<string[] | any[]> => {
        try {
            const regex = new RegExp(pattern.replace('*', '.*'));
            const keys: string[] = [];
            const items: any[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && regex.test(key)) {
                    keys.push(key);
                    if (returnValues) {
                        items.push({
                            key,
                            value: localStorage.getItem(key)
                        });
                    }
                }
            }

            return returnValues ? items : keys;
        } catch (err) {
            console.error('Error listing KV:', err);
            return [];
        }
    };

    const flushKV = async (): Promise<boolean> => {
        try {
            localStorage.clear();
            return true;
        } catch (err) {
            console.error('Error flushing KV:', err);
            return false;
        }
    };

    // File Store implementation using IndexedDB
    const uploadFile = async (files: File[] | Blob[]): Promise<{ path: string; name: string } | undefined> => {
        try {
            const db = await openDB();
            const file = files[0];
            if (!file) return undefined;

            const fileName = file instanceof File ? file.name : `file-${Date.now()}`;
            const path = `/uploads/${Date.now()}-${fileName}`;

            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');

            return new Promise((resolve, reject) => {
                const request = store.add({
                    path,
                    name: fileName,
                    data: file,
                    timestamp: Date.now()
                });

                request.onsuccess = () => {
                    resolve({ path, name: fileName });
                };
                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (err) {
            console.error('Error uploading file:', err);
            return undefined;
        }
    };

    const readFile = async (path: string): Promise<Blob | undefined> => {
        try {
            const db = await openDB();
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');

            return new Promise((resolve, reject) => {
                const request = store.get(path);

                request.onsuccess = () => {
                    resolve(request.result?.data);
                };
                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (err) {
            console.error('Error reading file:', err);
            return undefined;
        }
    };

    const deleteFile = async (path: string): Promise<void> => {
        try {
            const db = await openDB();
            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            store.delete(path);
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    };

    // AI Mock implementation
    const feedback = async (path: string, message: string): Promise<any> => {
        try {
            // Mock AI response - in production, this would call your backend API
            // Extract skills from the message (which contains resume text)
            const extractedSkills = extractSkillsFromResume(message);
            
            const mockFeedback = {
                message: {
                    content: JSON.stringify({
                        ats_score: Math.floor(Math.random() * 40) + 60,
                        overallScore: Math.floor(Math.random() * 40) + 60,
                        toneAndStyle: {
                            score: Math.floor(Math.random() * 40) + 60,
                            feedback: "Good professional tone",
                            tips: [
                                { type: "good", tip: "Professional tone", explanation: "Your resume maintains a professional and formal tone throughout." },
                                { type: "improve", tip: "Action verbs", explanation: "Use more action verbs to describe your accomplishments." }
                            ]
                        },
                        content: {
                            score: Math.floor(Math.random() * 40) + 60,
                            feedback: "Strong content and achievements",
                            tips: [
                                { type: "good", tip: "Clear achievements", explanation: "Your achievements are clearly stated and measurable." },
                                { type: "improve", tip: "Add metrics", explanation: "Include more quantifiable metrics and results." }
                            ]
                        },
                        structure: {
                            score: Math.floor(Math.random() * 40) + 60,
                            feedback: "Well-organized structure",
                            tips: [
                                { type: "good", tip: "Good organization", explanation: "Your resume is well-organized and easy to read." },
                                { type: "improve", tip: "Improve spacing", explanation: "Add more white space between sections for better readability." }
                            ]
                        },
                        skills: {
                            score: Math.floor(Math.random() * 40) + 60,
                            feedback: "Good skill representation",
                            tips: [
                                { type: "good", tip: "Relevant skills", explanation: "Your skills are relevant to the job description." },
                                { type: "improve", tip: "Add technical skills", explanation: "Include more specific technical skills and tools." }
                            ]
                        },
                        strengths: [
                            "Strong technical background",
                            "Clear career progression",
                            "Relevant experience"
                        ],
                        improvements: [
                            { type: "improve", tip: "Add more quantifiable achievements" },
                            { type: "improve", tip: "Include specific technologies used" },
                            { type: "good", tip: "Good formatting and readability" }
                        ],
                        keywords_found: extractedSkills,
                        keywords_missing: ["Cloud", "DevOps", "Machine Learning"],
                        overall_feedback: "Your resume is well-structured. Focus on adding more metrics and specific achievements to improve your ATS score.",
                        // Added for Smart ATS Logic - Extract from resume
                        extracted_skills_present: extractedSkills,
                        extracted_skills_required: ["Python", "React", "TypeScript", "Node.js", "Docker"],
                        extracted_experience_years: 3,
                        ATS: {
                            score: 0,
                            tips: [
                                { type: "improve", tip: "Add TypeScript" },
                                { type: "good", tip: "Strong React skills" }
                            ]
                        }
                    })
                }
            };
            return mockFeedback;
        } catch (err) {
            console.error('Error getting feedback:', err);
            return undefined;
        }
    };

    const img2txt = async (image: string | File | Blob): Promise<string> => {
        try {
            // Mock OCR - in production, this would call your backend API
            return "Mock OCR text extracted from image";
        } catch (err) {
            console.error('Error extracting text from image:', err);
            return "";
        }
    };

    return {
        isLoading: false,
        error: null,
        
        kv: {
            get: getKV,
            set: setKV,
            delete: deleteKV,
            list: listKV,
            flush: flushKV,
        },
        
        fs: {
            upload: uploadFile,
            read: readFile,
            delete: deleteFile,
        },
        
        ai: {
            feedback,
            img2txt,
        },
        
        init: () => {
            set({ isLoading: false });
        },
        
        clearError: () => set({ error: null }),
    };
});
