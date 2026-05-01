/**
 * Mock GitHub Analysis Data
 * Used for testing until backend API is ready
 */

export interface GitHubAnalysisResult {
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

export const generateMockAnalysis = (
  username: string,
  skills: string[]
): GitHubAnalysisResult => {
  // Simulate different profiles based on username
  const isGoodProfile = username.toLowerCase().includes('sumit') || username.toLowerCase().includes('dev');
  
  const baseScore = isGoodProfile ? 75 : 55;
  const skillMatch = Math.min(100, (skills.length * 20) + (isGoodProfile ? 30 : 10));
  
  return {
    profile: {
      username: username,
      name: `${username} Developer`,
      bio: isGoodProfile 
        ? 'Full-stack developer passionate about building amazing products'
        : 'Learning to code',
      public_repos: isGoodProfile ? 15 : 5,
      followers: isGoodProfile ? 120 : 10,
      following: isGoodProfile ? 45 : 20,
      created_at: isGoodProfile 
        ? '2019-03-15T10:30:00Z'
        : '2023-06-20T14:45:00Z',
    },
    languages: {
      JavaScript: isGoodProfile ? 8 : 3,
      TypeScript: isGoodProfile ? 6 : 1,
      Python: isGoodProfile ? 5 : 0,
      React: isGoodProfile ? 7 : 2,
      'Node.js': isGoodProfile ? 6 : 1,
      HTML: isGoodProfile ? 8 : 5,
      CSS: isGoodProfile ? 8 : 5,
    },
    repositories: [
      {
        name: isGoodProfile ? 'ai-resume-analyzer' : 'todo-app',
        url: `https://github.com/${username}/${isGoodProfile ? 'ai-resume-analyzer' : 'todo-app'}`,
        stars: isGoodProfile ? 120 : 5,
        depth: {
          score: isGoodProfile ? 85 : 30,
          level: isGoodProfile ? 'Advanced' : 'Beginner',
          indicators: isGoodProfile
            ? [
                'Backend language detected',
                'Frontend language detected',
                'Complex features mentioned',
                'Popular project (120 stars)',
              ]
            : ['Frontend language detected', 'Simple project'],
        },
        originality: {
          score: isGoodProfile ? 80 : 20,
          is_likely_tutorial: !isGoodProfile,
          indicators: isGoodProfile
            ? ['Original project name', 'Unique architecture']
            : ['Tutorial-based project name', 'Common project type'],
        },
        consistency: {
          score: isGoodProfile ? 85 : 30,
          level: isGoodProfile ? 'Very Active' : 'Sporadic',
          commits_count: isGoodProfile ? 250 : 15,
        },
      },
      {
        name: isGoodProfile ? 'ecommerce-platform' : 'weather-app',
        url: `https://github.com/${username}/${isGoodProfile ? 'ecommerce-platform' : 'weather-app'}`,
        stars: isGoodProfile ? 85 : 3,
        depth: {
          score: isGoodProfile ? 80 : 25,
          level: isGoodProfile ? 'Advanced' : 'Beginner',
          indicators: isGoodProfile
            ? [
                'Backend language detected',
                'Complex features mentioned',
                'Popular project (85 stars)',
              ]
            : ['Frontend language detected'],
        },
        originality: {
          score: isGoodProfile ? 75 : 15,
          is_likely_tutorial: !isGoodProfile,
          indicators: isGoodProfile
            ? ['Partially original', 'Added custom features']
            : ['Tutorial-based project name', 'Common project type'],
        },
        consistency: {
          score: isGoodProfile ? 80 : 25,
          level: isGoodProfile ? 'Active' : 'Sporadic',
          commits_count: isGoodProfile ? 180 : 10,
        },
      },
      {
        name: isGoodProfile ? 'real-estate-cms' : 'calculator',
        url: `https://github.com/${username}/${isGoodProfile ? 'real-estate-cms' : 'calculator'}`,
        stars: isGoodProfile ? 45 : 1,
        depth: {
          score: isGoodProfile ? 75 : 20,
          level: isGoodProfile ? 'Intermediate' : 'Beginner',
          indicators: isGoodProfile
            ? ['Backend language detected', 'Complex features mentioned']
            : ['Frontend language detected', 'Simple project'],
        },
        originality: {
          score: isGoodProfile ? 70 : 10,
          is_likely_tutorial: !isGoodProfile,
          indicators: isGoodProfile
            ? ['Original project', 'Solves real problem']
            : ['Tutorial-based project name'],
        },
        consistency: {
          score: isGoodProfile ? 75 : 20,
          level: isGoodProfile ? 'Moderate' : 'Inactive',
          commits_count: isGoodProfile ? 120 : 5,
        },
      },
    ],
    skill_verification: {
      score: skillMatch,
      verified: skills.slice(0, Math.ceil(skills.length * 0.7)),
      unverified: skills.slice(Math.ceil(skills.length * 0.7)),
      github_languages: [
        'JavaScript',
        'TypeScript',
        'Python',
        'React',
        'Node.js',
        'HTML',
        'CSS',
      ],
    },
    authenticity_score: {
      total_score: baseScore,
      level: baseScore >= 70 ? 'Advanced' : baseScore >= 50 ? 'Intermediate' : 'Beginner',
      breakdown: {
        project_depth: isGoodProfile ? 85 : 30,
        skill_match: skillMatch,
        consistency: isGoodProfile ? 85 : 30,
        originality: isGoodProfile ? 75 : 20,
      },
    },
    recommendations: isGoodProfile
      ? [
          'Continue building real-world projects',
          'Consider contributing to open source',
          'Document your projects better',
          'Share your knowledge through blog posts',
        ]
      : [
          'Build more real-world projects beyond tutorials',
          'Focus on backend development experience',
          'Increase GitHub activity and consistency',
          'Create original projects that solve real problems',
          'Document your projects with comprehensive READMEs',
        ],
  };
};

/**
 * Simulate API call with delay
 */
export const mockAnalyzeGitHub = async (
  username: string,
  skills: string[]
): Promise<GitHubAnalysisResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Return mock data
  return generateMockAnalysis(username, skills);
};
