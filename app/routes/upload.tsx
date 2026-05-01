import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {useStorageStore} from "~/lib/storage";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { isLoading, fs, ai, kv } = useStorageStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        try {
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) return setStatusText('Error: Failed to upload file');

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) return setStatusText('Error: Failed to upload image');

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing...');

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) {
                setIsProcessing(false);
                return setStatusText('Error: Failed to analyze resume');
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            let parsedFeedback;
            try {
                // Sometimes AI returns markdown like ```json ... ```
                const cleanJson = feedbackText.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedFeedback = JSON.parse(cleanJson);
            } catch (err) {
                console.error('JSON Parse Error:', err, feedbackText);
                setIsProcessing(false);
                return setStatusText('Error: Failed to parse AI response. See console.');
            }

            if (parsedFeedback.is_resume === false) {
                throw new Error(parsedFeedback.error_message || 'The uploaded document does not appear to be a valid resume.');
            }

            // Smart ATS Upgrade Logic via Backend ML
            const skills_present = parsedFeedback.extracted_skills_present || [];
            const skills_required = parsedFeedback.extracted_skills_required || [];
            const experience = parsedFeedback.extracted_experience_years || 0;
            const resumeText = await ai.img2txt(imageFile.file) || "Mock resume text";

            setStatusText('Running Advanced ML Model...');
            const mlResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills_present,
                    skills_required,
                    experience,
                    projects: ["Portfolio", "Project"], // Dummy since AI doesn't extract yet
                    education: "B.Tech CSE",
                    resume_text: resumeText
                })
            });

            if (!mlResponse.ok) {
                throw new Error('ML API Analysis failed');
            }

            const mlData = await mlResponse.json();

            setStatusText('Predicting Job Category...');
            const classifyResponse = await fetch('/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText })
            });
            const classifyData = classifyResponse.ok ? await classifyResponse.json() : { category: "Unknown" };

            parsedFeedback.ATS = parsedFeedback.ATS || { score: 0, tips: [] };
            parsedFeedback.ATS.score = mlData.ats_score;
            parsedFeedback.missing_skills = mlData.missing_skills;
            parsedFeedback.predicted_category = classifyData.category;

            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            navigate(`/resume/${uuid}`);
        } catch (error: any) {
            console.error(error);
            setIsProcessing(false);
            setStatusText(`Error: ${error?.message || 'Something went wrong'}`);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <>
                            {statusText && statusText.startsWith('Error') && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 animate-in fade-in max-w-xl mx-auto" role="alert">
                                    <strong className="font-bold">Oops! </strong>
                                    <span className="block sm:inline">{statusText}</span>
                                </div>
                            )}
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                        </>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
