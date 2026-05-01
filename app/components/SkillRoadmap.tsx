import React from 'react';

interface SkillRoadmapProps {
  missingSkills: string[];
  companyName?: string;
  jobTitle?: string;
}

const SkillRoadmap: React.FC<SkillRoadmapProps> = ({ missingSkills, companyName, jobTitle }) => {
  if (!missingSkills || missingSkills.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-md p-6 border border-green-100">
        <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Perfect Match!</h3>
        <p className="text-gray-600">
          You have all the required skills for this position. {companyName ? `${companyName} will be lucky to have you!` : 'You are good to go!'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md w-full p-6 border border-blue-100 mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
          🚀 Personalized Skill Roadmap
        </h2>
        <p className="text-gray-600 mt-2">
          Your path to landing {jobTitle ? `the ${jobTitle} role` : 'your dream job'} 
          {companyName ? ` at ${companyName}` : ''}.
        </p>
      </div>

      <div className="relative border-l-2 border-indigo-200 ml-4 space-y-6">
        {missingSkills.map((skill, index) => (
          <div key={index} className="relative pl-6">
            {/* Timeline Dot */}
            <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-[9px] top-1 border-4 border-white shadow-sm" />
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-800 text-lg mb-1">Step {index + 1}: Master {skill}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {companyName ? `${companyName} highly values this skill for their tech stack.` : 'This skill is highly demanded for this role.'}
              </p>
              
              <div className="flex gap-2">
                <a 
                  href={`https://www.youtube.com/results?search_query=${skill}+crash+course`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  ▶️ YouTube
                </a>
                <a 
                  href={`https://www.coursera.org/search?query=${skill}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  🎓 Coursera
                </a>
                <a 
                  href={`https://roadmap.sh/search?q=${skill}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                >
                  🗺️ Roadmap.sh
                </a>
              </div>
            </div>
          </div>
        ))}

        <div className="relative pl-6">
          <div className="absolute w-5 h-5 bg-green-500 rounded-full -left-[11px] -bottom-1 border-4 border-white shadow-sm flex items-center justify-center">
            <span className="text-[10px]">✨</span>
          </div>
          <div className="pt-2">
            <h4 className="font-bold text-green-700">Interview Ready!</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillRoadmap;
