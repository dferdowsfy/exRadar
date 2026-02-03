// OpenRouter API Integration for Executive Radar
// Using GPT-4o-mini with search capabilities
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

if (!OPENROUTER_API_KEY) {
    console.error('Missing VITE_OPENROUTER_API_KEY environment variable');
}
const MODEL = 'openai/gpt-4o-mini-search-preview';

async function callOpenRouter(messages, temperature = 0.8, maxTokens = 16000) {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://dferdowsfy.github.io/exRadar',
            'X-Title': 'Executive Radar'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', response.status, errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

function cleanJsonResponse(text) {
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    }
    if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    return cleanedText.trim();
}

export async function generateOpportunities(searchQuery, count = 20, userProfile = null, options = {}) {
    const { includeFractional = false } = options;

    const profileContext = userProfile ? `
CRITICAL - USER RESUME CONTEXT:
The user has the following background. You MUST score and rank opportunities based on alignment with this profile:
- **Skills:** ${userProfile.skills?.join(', ') || 'Not specified'}
- **Experience Summary:** ${userProfile.summary || 'Not specified'}
- **Target Roles:** ${userProfile.targetRoles?.join(', ') || 'Executive/VP level'}
- **Past Industries:** ${userProfile.industries?.join(', ') || 'Not specified'}
- **Past Companies:** ${userProfile.companies?.join(', ') || 'Not specified'}
- **Strengths:** ${userProfile.strengths?.join(', ') || 'Not specified'}

Generate opportunities that specifically match this candidate's background. Calculate a "fitScore" (0-100) based on how well the user's specific skills and experience match the role requirements.
` : '';

    const fractionalContext = includeFractional ? `
INCLUDE FRACTIONAL/PART-TIME ROLES:
Include fractional executive roles, part-time advisory positions, and interim leadership opportunities such as:
- Fractional CPO, Fractional CTO, Fractional VP Product
- Interim Head of AI, Interim VP Engineering
- Part-time AI Advisor, Strategic Advisor roles
- Board Advisory positions
Mark these with "isFractional": true in the response.
` : '';

    const prompt = `You are an elite executive recruiter with access to real-time job market data via web search. Search the internet and generate exactly ${count} realistic executive job opportunities for the search query: "${searchQuery}".

${profileContext}
${fractionalContext}

IMPORTANT: Use your web search capabilities to find REAL, CURRENT opportunities from:
- Recent funding announcements (Series A-E in the last 6 months)
- Executive departures and leadership changes
- Fast-growing startups in AI, security, robotics, fintech
- Companies actively hiring for leadership roles on LinkedIn, Greenhouse, Lever

Return a JSON array with exactly ${count} objects. Each object must have:
{
  "company": "Real company name",
  "role": "Specific executive role (e.g. 'VP of Product', 'Fractional CPO', 'Head of AI Engineering')",
  "isFractional": false,
  "description": "2-3 sentences about the company's core business and market position.",
  "hiringLeader": {
    "name": "CEO/Founder name",
    "title": "Title",
    "email": "contact@company.com",
    "linkedin": "https://linkedin.com/company/companyname"
  },
  "location": "City, State (or Remote)",
  "employees": 100,
  "fundingStage": "e.g. 'Series B ($50M)'",
  "fundingDate": "e.g. 'Jan 2026'",
  "revenue": "e.g. '$10M ARR'",
  "remote": true,
  "signals": ["FUNDING"],
  "sector": "agentic-ai",
  "confidence": 85,
  "fitScore": 80,
  "fitReasons": ["Skill match", "Industry alignment"],
  "matchAnalysis": "Brief explanation of fit.",
  "strategicDirection": "Company direction.",
  "futureProofReasoning": "Why this company is resilient.",
  "jobUrl": "https://www.linkedin.com/jobs/search/?keywords=role+company",
  "newsSource": "Recent headline",
  "website": "company.com"
}

CRITICAL: Return ONLY a valid JSON array, no markdown, no explanations.`;

    try {
        console.log('Calling OpenRouter API for opportunities...');
        const text = await callOpenRouter([
            { role: 'user', content: prompt }
        ], 0.8, 16000);

        if (!text) {
            throw new Error('No response from OpenRouter');
        }

        const cleanedText = cleanJsonResponse(text);
        const opportunities = JSON.parse(cleanedText);

        // Add IDs and icons to each opportunity
        const icons = ['shield', 'target', 'cpu', 'code', 'brain', 'cloud', 'rocket', 'layers', 'server', 'bot'];
        return opportunities.map((opp, index) => ({
            ...opp,
            id: 1000 + index,
            icon: icons[index % icons.length],
            dateIdentified: new Date().toISOString().split('T')[0]
        }));

    } catch (error) {
        console.error('OpenRouter API error:', error);
        throw error;
    }
}

export async function enrichOpportunity(company, role) {
    const prompt = `Search for detailed information about the executive opportunity at ${company} for the role: ${role}.

Return a JSON object with:
{
  "companyOverview": "3-4 sentences about what the company does, their main products, and market position",
  "strategicDirection": "3-4 sentences about where the company is heading",
  "recentNews": ["headline 1", "headline 2", "headline 3"],
  "keyExecutives": [
    {"name": "Name", "title": "Title", "linkedin": "linkedin url"}
  ],
  "jobDescription": "Role requirements",
  "competitiveAdvantage": "What makes this company unique",
  "challenges": "Key challenges the company faces",
  "whyJoinNow": "Why this is an opportune time to join"
}

Return ONLY valid JSON, no markdown.`;

    try {
        const text = await callOpenRouter([
            { role: 'user', content: prompt }
        ], 0.7, 4096);

        const cleanedText = cleanJsonResponse(text);
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error('Enrichment error:', error);
        return null;
    }
}

// Parse resume text to extract structured profile data
export async function parseResume(resumeText) {
    const prompt = `Analyze this resume and extract structured information:

${resumeText}

Return a JSON object with:
{
  "name": "Full name",
  "title": "Current or most recent job title",
  "email": "Email if found",
  "phone": "Phone if found",
  "location": "Location if found",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2"] (list of key skills, max 15),
  "experience": "Brief summary of experience level and years",
  "industries": ["industry1", "industry2"] (industries they've worked in),
  "companies": ["company1", "company2"] (notable companies worked at),
  "targetRoles": ["VP Product", "Head of Engineering"] (suggested executive roles based on background),
  "strengths": ["strength1", "strength2", "strength3"] (top 3 professional strengths),
  "idealCompanyStage": "Startup | Growth | Enterprise | Any",
  "topSectors": ["ai-security", "agentic-ai"] (best matching sectors from: agentic-ai, ai-security, physical-ai, vibe-coding, ai-infra, vertical-ai)
}

Return ONLY valid JSON, no markdown.`;

    try {
        console.log('Parsing resume with OpenRouter...');
        const text = await callOpenRouter([
            { role: 'user', content: prompt }
        ], 0.3, 4096);

        const cleanedText = cleanJsonResponse(text);
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error('Resume parsing error:', error);
        return null;
    }
}
