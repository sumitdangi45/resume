import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {useStorageStore} from "~/lib/storage";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import SkillRoadmap from "~/components/SkillRoadmap";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { isLoading, fs, kv } = useStorageStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);
            setCompanyName(data.companyName || '');
            setJobTitle(data.jobTitle || '');

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback?.predicted_category && (
                        <div className="flex items-center gap-2 mt-2 mb-6 animate-in fade-in duration-500">
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-2">
                                ✨ AI Predicted Role: {feedback.predicted_category}
                            </span>
                        </div>
                    )}
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS 
                                score={feedback.ATS?.score || feedback.ats_score || 0} 
                                suggestions={feedback.ATS?.tips || feedback.improvements || []} 
                                missingSkills={feedback.missing_skills || []} 
                            />
                            <SkillRoadmap 
                                missingSkills={feedback.missing_skills || []} 
                                companyName={companyName} 
                                jobTitle={jobTitle} 
                            />
                            <Details feedback={feedback} />
                            
                            {/* GitHub Analyzer Button */}
                            {feedback.extracted_skills_present && feedback.extracted_skills_present.length > 0 && (
                                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
                                    <h3 className="text-lg font-bold mb-2">Verify Your Skills on GitHub</h3>
                                    <p className="text-slate-300 mb-4">
                                        We found {feedback.extracted_skills_present.length} skills in your resume. 
                                        Verify them against your GitHub profile to get an authenticity score.
                                    </p>
                                    <Link
                                        to={`/github?resumeId=${id}`}
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                                    >
                                        Analyze GitHub Profile →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
