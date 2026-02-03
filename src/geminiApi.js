// Gemini API Integration for Executive Radar
// Use environment variable or fallback to hardcoded key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDUMXY4SRekjLcVBDrJVW90suGMhyGhvjE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function generateOpportunities(searchQuery, count = 50, userProfile = null, options = {}) {
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

    const prompt = `You are an elite executive recruiter with access to real-time job market data. Generate exactly ${count} realistic executive job opportunities for the search query: "${searchQuery}".

${profileContext}
${fractionalContext}

IMPORTANT: Search for REAL, CURRENT opportunities. Think about:
- Companies that recently raised funding (Series A-E in the last 6 months)
- Companies with recent executive departures
- Fast-growing startups in AI, security, robotics, fintech
- Companies actively hiring for leadership roles

Return a JSON array with exactly ${count} objects. Each object must have:
{
  "company": "Real company name (active tech companies only)",
  "role": "Specific executive role (e.g. 'VP of Product', 'Fractional CPO', 'Head of AI Engineering')",
  "isFractional": boolean (true if this is a fractional/part-time/advisory role),
  "description": "2-3 sentences about the company's core business and market position.",
  "hiringLeader": {
    "name": "Real Name (CEO/Founder/Executive)",
    "title": "Actual Title",
    "email": "firstname.lastname@company.com (guess the most likely pattern)",
    "linkedin": "https://linkedin.com/in/[handle]"
  },
  "location": "City, State (or Remote)",
  "employees": number,
  "fundingStage": "e.g. 'Series B ($50M)'",
  "fundingDate": "e.g. 'Jan 2026'",
  "revenue": "e.g. '$10M ARR'",
  "remote": boolean,
  "signals": ["FUNDING", "GROWTH", "DEPARTURE", "PIVOT", "UNICORN", "STEALTH"] (select 1-3),
  "sector": "agentic-ai" | "ai-security" | "physical-ai" | "vibe-coding" | "ai-infra" | "vertical-ai",
  "confidence": number 80-99 (how likely this role exists),
  
  "fitScore": number 60-99 (based on resume alignment if provided, otherwise relevance to search),
  "fitReasons": ["Specific matching skill", "Industry alignment", "Experience level match"],
  "matchAnalysis": "2 sentences explaining WHY this specific candidate is a good fit for this specific role based on their resume context.",
  
  "strategicDirection": "2 sentences on their immediate roadmap.",
  "futureProofReasoning": "Explain why this company is resilient to AI disruption.",
  
  "jobUrl": "DIRECT URL to job posting or LinkedIn jobs search. Use: 'https://www.linkedin.com/jobs/search/?keywords=[role]+[company]' format.",
  "newsSource": "Recent headline about funding, growth, or leadership changes",
  "website": "domain.com"
}

CRITICAL RULES:
1. Generate DIVERSE companies - mix of startups, growth-stage, and established tech.
2. If resume provided, prioritize opportunities matching their specific skills.
3. Include a mix of full-time and ${includeFractional ? 'fractional/advisory' : 'leadership'} roles.
4. Generate ${count} UNIQUE results. Do not repeat companies.

Return ONLY valid JSON array.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.85,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 65536, // Increased for larger result sets
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini');
        }

        // Clean up the response - remove markdown code blocks if present
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

        const opportunities = JSON.parse(cleanedText.trim());

        // Add IDs and icons to each opportunity
        const icons = ['shield', 'target', 'cpu', 'code', 'brain', 'cloud', 'rocket', 'layers', 'server', 'bot'];
        return opportunities.map((opp, index) => ({
            ...opp,
            id: 1000 + index,
            icon: icons[index % icons.length],
            dateIdentified: new Date().toISOString().split('T')[0]
        }));

    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

export async function enrichOpportunity(company, role) {
    const prompt = `Provide detailed information about the executive opportunity at ${company} for the role: ${role}.

Return a JSON object with:
{
  "companyOverview": "3-4 sentences about what the company does, their main products, and market position",
  "strategicDirection": "3-4 sentences about where the company is heading - recent pivots, expansion plans, new product areas",
  "recentNews": ["headline 1", "headline 2", "headline 3"],
  "keyExecutives": [
    {"name": "Name", "title": "Title", "linkedin": "linkedin url"}
  ],
  "jobDescription": "If you know of an active job posting, describe the role requirements. Otherwise provide typical requirements for this role at this company.",
  "competitiveAdvantage": "What makes this company unique in their space",
  "challenges": "Key challenges the company faces",
  "whyJoinNow": "Why this is an opportune time to join"
}

Return ONLY valid JSON, no markdown.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

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

        return JSON.parse(cleanedText.trim());

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
  "skills": ["skill1", "skill2", ...] (list of key skills, max 15),
  "experience": "Brief summary of experience level and years",
  "industries": ["industry1", "industry2", ...] (industries they've worked in),
  "companies": ["company1", "company2", ...] (notable companies worked at),
  "targetRoles": ["VP Product", "Head of Engineering", ...] (suggested executive roles based on background),
  "strengths": ["strength1", "strength2", "strength3"] (top 3 professional strengths),
  "idealCompanyStage": "Startup | Growth | Enterprise | Any" (best fit company stage),
  "topSectors": ["ai-security", "agentic-ai", ...] (best matching sectors from: agentic-ai, ai-security, physical-ai, vibe-coding, ai-infra, vertical-ai)
}

Return ONLY valid JSON, no markdown.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

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

        return JSON.parse(cleanedText.trim());

    } catch (error) {
        console.error('Resume parsing error:', error);
        return null;
    }
}
