import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Navbar from '~/components/Navbar';
import { mockAnalyzeGitHub } from '~/lib/github-mock';
import { useStorageStore } from '~/lib/storage';

interface GitHubAnalysisResult {
  profile: {
    username: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  };
  languages: Record<string, number>;
  repositories: Array<{
    name: string;
    url: string;
    stars: number;
    depth: {
      score: number;
      level: string;
      indicators: string[];
    };
    originality: {
      score: number;
      is_likely_tutorial: boolean;
      indicators: string[];
    };
    consistency: {
      score: number;
      level: string;
      commits_count: number;
    };
  }>;
  skill_verification: {
    score: number;
    verified: string[];
    unverified: string[];
    github_languages: string[];
  };
  authenticity_score: {
    total_score: number;
    level: string;
    breakdown: {
      project_depth: number;
      skill_match: number;
      consistency: number;
      originality: number;
    };
  };
  recommendations: string[];
}

const GitHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { kv } = useStorageStore();
  const [githubUsername, setGithubUsername] = useState('');
  const [resumeSkills, setResumeSkills] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<GitHubAnalysisResult | null>(null);

  // Load skills from resume if passed via query parameter
  useEffect(() => {
    const loadResumeSkills = async () => {
      const resumeIdParam = searchParams.get('resumeId');
      const skillsParam = searchParams.get('skills');
      
      if (resumeIdParam) {
        try {
          setResumeId(resumeIdParam);
          // Fetch resume data from storage
          const resumeData = await kv.get(`resume:${resumeIdParam}`);
          if (resumeData) {
            const parsed = JSON.parse(resumeData);
            const extractedSkills = parsed.feedback?.extracted_skills_present || [];
            if (extractedSkills.length > 0) {
              setResumeSkills(extractedSkills.join(', '));
            }
          }
        } catch (err) {
          console.error('Error loading resume skills:', err);
        }
      } else if (skillsParam) {
        try {
          const decodedSkills = decodeURIComponent(skillsParam);
          setResumeSkills(decodedSkills);
        } catch (err) {
          console.error('Error decoding skills:', err);
        }
      }
    };
    
    loadResumeSkills();
  }, [searchParams, kv]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const skills = resumeSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      if (!githubUsername.trim()) {
        setError('Please enter a GitHub username');
        setIsLoading(false);
        return;
      }

      if (skills.length === 0) {
        setError('Please enter at least one skill');
        setIsLoading(false);
        return;
      }

      // Use mock data for now (until backend is ready)
      const result = await mockAnalyzeGitHub(githubUsername, skills);
      setAnalysis(result);
      
      // TODO: Replace with actual backend API call when ready
      // const response = await fetch('/api/analyze-github', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     github_username: githubUsername,
      //     resume_skills: skills,
      //   }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.detail || 'Failed to analyze GitHub profile');
      // }
      // const result = await response.json();
      // setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            GitHub Profile Analyzer
          </h1>
          <p className="text-lg text-slate-600">
            Verify your skills authenticity by analyzing your GitHub profile
          </p>
        </div>

        {/* Form Section */}
        {!analysis && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <form onSubmit={handleAnalyze} className="space-y-6">
              {/* GitHub Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g., sumitdangi45"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Enter your GitHub username (public profile)
                </p>
              </div>

              {/* Resume Skills */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Skills (from resume)
                </label>
                <textarea
                  value={resumeSkills}
                  readOnly
                  placeholder="Skills will be loaded from your resume..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 cursor-not-allowed"
                  disabled
                />
                <p className="text-sm text-slate-500 mt-1">
                  Skills are automatically extracted from your resume analysis
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {isLoading ? 'Analyzing...' : 'Analyze GitHub Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setAnalysis(null);
                setGithubUsername('');
                setResumeSkills('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Analyze Another Profile
            </button>

            {/* Skill Authenticity Score */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
              <p className="text-blue-100 text-sm font-medium mb-2">
                Skill Authenticity Score
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-5xl font-bold">
                    {Math.round(analysis.authenticity_score.total_score)}%
                  </p>
                  <p className="text-blue-100 mt-2">
                    Level: {analysis.authenticity_score.level}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm space-y-1">
                    <p>Project Depth: {analysis.authenticity_score.breakdown.project_depth.toFixed(1)}%</p>
                    <p>Skill Match: {analysis.authenticity_score.breakdown.skill_match.toFixed(1)}%</p>
                    <p>Consistency: {analysis.authenticity_score.breakdown.consistency.toFixed(1)}%</p>
                    <p>Originality: {analysis.authenticity_score.breakdown.originality.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">GitHub Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-600 text-sm">Username</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {analysis.profile.username}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Public Repos</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {analysis.profile.public_repos}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Followers</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {analysis.profile.followers}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Member Since</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(analysis.profile.created_at).getFullYear()}
                  </p>
                </div>
              </div>
              {analysis.profile.bio && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-slate-600 text-sm">Bio</p>
                  <p className="text-slate-900">{analysis.profile.bio}</p>
                </div>
              )}
            </div>

            {/* Skill Verification */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Skill Verification</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Verified Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-4">
                    ✅ Verified Skills ({analysis.skill_verification.verified.length})
                  </h3>
                  <div className="space-y-2">
                    {analysis.skill_verification.verified.length > 0 ? (
                      analysis.skill_verification.verified.map((skill) => (
                        <div
                          key={skill}
                          className="bg-green-50 border border-green-200 rounded-lg p-3"
                        >
                          <p className="text-green-900 font-medium">{skill}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-600">No verified skills</p>
                    )}
                  </div>
                </div>

                {/* Unverified Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-4">
                    ⚠️ Unverified Skills ({analysis.skill_verification.unverified.length})
                  </h3>
                  <div className="space-y-2">
                    {analysis.skill_verification.unverified.length > 0 ? (
                      analysis.skill_verification.unverified.map((skill) => (
                        <div
                          key={skill}
                          className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                        >
                          <p className="text-orange-900 font-medium">{skill}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-600">All skills verified!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* GitHub Languages */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Languages Found on GitHub
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.skill_verification.github_languages).map(
                    (lang) => (
                      <span
                        key={lang}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Top Repositories */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Top Repositories Analysis
              </h2>
              <div className="space-y-6">
                {analysis.repositories.map((repo) => (
                  <div
                    key={repo.name}
                    className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {repo.name}
                        </a>
                        <p className="text-slate-600 text-sm mt-1">
                          ⭐ {repo.stars} stars
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Project Depth */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                          Project Depth
                        </p>
                        <div className="bg-slate-100 rounded-lg p-3">
                          <p className="text-lg font-bold text-slate-900">
                            {repo.depth.score}%
                          </p>
                          <p className="text-sm text-slate-600">{repo.depth.level}</p>
                          <div className="mt-2 space-y-1">
                            {repo.depth.indicators.map((indicator) => (
                              <p key={indicator} className="text-xs text-slate-600">
                                • {indicator}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Originality */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                          Originality
                        </p>
                        <div className="bg-slate-100 rounded-lg p-3">
                          <p className="text-lg font-bold text-slate-900">
                            {repo.originality.score}%
                          </p>
                          <p className="text-sm text-slate-600">
                            {repo.originality.is_likely_tutorial
                              ? 'Tutorial-Based'
                              : 'Original'}
                          </p>
                          <div className="mt-2 space-y-1">
                            {repo.originality.indicators.map((indicator) => (
                              <p key={indicator} className="text-xs text-slate-600">
                                • {indicator}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Consistency */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                          Consistency
                        </p>
                        <div className="bg-slate-100 rounded-lg p-3">
                          <p className="text-lg font-bold text-slate-900">
                            {repo.consistency.score}%
                          </p>
                          <p className="text-sm text-slate-600">
                            {repo.consistency.level}
                          </p>
                          <p className="text-xs text-slate-600 mt-2">
                            {repo.consistency.commits_count} commits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommendations</h2>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <span className="text-blue-600 font-bold flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <p className="text-blue-900">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHub;
