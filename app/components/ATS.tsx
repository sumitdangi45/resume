import React, { useEffect, useState } from 'react';

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
  missingSkills?: string[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions, missingSkills = [] }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let currentScore = 0;
    const interval = setInterval(() => {
      currentScore += 1;
      setAnimatedScore(currentScore);
      if (currentScore >= score) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const gradientClass = score > 69
    ? 'from-green-100 to-white'
    : score > 49
      ? 'from-yellow-100 to-white'
      : 'from-red-100 to-white';

  const strokeColor = score > 69 ? '#10b981' : score > 49 ? '#f59e0b' : '#ef4444';
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`bg-gradient-to-b ${gradientClass} rounded-2xl shadow-md w-full p-6 transition-all duration-500`}>
      <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
        
        {/* Animated Progress Circle */}
        <div className="relative flex items-center justify-center w-32 h-32">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={strokeColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{animatedScore}%</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">ATS Match</span>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Smart ATS Analysis</h2>
          <p className="text-gray-600">
            This score predicts how well your resume matches the job description using advanced ML weighting for skills and experience.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
                <img src="/icons/ats-warning.svg" alt="Suggestions" className="w-6 h-6" />
                Improvement Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/50 p-3 rounded-lg border border-white/60">
                  <img
                    src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                    alt={suggestion.type === "good" ? "Check" : "Warning"}
                    className="w-5 h-5 mt-1"
                  />
                  <p className={suggestion.type === "good" ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                    {suggestion.tip}
                  </p>
                </div>
              ))}
            </div>
        </div>

        {missingSkills.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-red-500 font-bold text-xl">❌</span>
                    Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-sm font-semibold shadow-sm animate-in zoom-in duration-300">
                        {skill}
                    </span>
                  ))}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default ATS;
