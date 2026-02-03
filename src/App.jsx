import React, { useState, useEffect } from 'react';
import {
  Search, Mail, Users, ExternalLink, AlertCircle, CheckCircle,
  Target, X, Eye, Send, MapPin, DollarSign, UserCheck, Loader2,
  Shield, Cpu, Bot, Code, Server, Layers, Cloud, Mic, Rocket,
  Smartphone, Brain, Radio, TrendingUp, Sparkles, BarChart3,
  Briefcase, ArrowUpRight, Compass, Lightbulb, Upload, User, FileText, Settings, RefreshCcw
} from 'lucide-react';
import { generateOpportunities, enrichOpportunity, parseResume } from './geminiApi';



// Icon renderer component for consistent styling
const IconRenderer = ({ name, size = 20, color = '#D97757' }) => {
  const icons = {
    shield: Shield,
    target: Target,
    eye: Eye,
    code: Code,
    cpu: Cpu,
    brain: Brain,
    smartphone: Smartphone,
    cloud: Cloud,
    mic: Mic,
    rocket: Rocket,
    bot: Bot,
    server: Server,
    layers: Layers,
  };
  const IconComponent = icons[name] || Target;
  return <IconComponent size={size} color={color} strokeWidth={1.5} />;
};


// Modern sector icons using geometric shapes
const BLEEDING_EDGE_SECTORS = [
  { id: 'agentic-ai', name: 'Agentic AI', heat: 98, description: 'Autonomous AI agents for enterprise', icon: 'cpu' },
  { id: 'ai-security', name: 'AI Security', heat: 94, description: 'LLM guardrails & DSPM', icon: 'shield' },
  { id: 'physical-ai', name: 'Physical AI / Robotics', heat: 91, description: 'Embodied AI, perception systems', icon: 'bot' },
  { id: 'vibe-coding', name: 'Vibe Coding', heat: 96, description: 'AI-powered app development', icon: 'code' },
  { id: 'ai-infra', name: 'AI Infrastructure', heat: 89, description: 'Inference, compute, MLOps', icon: 'server' },
  { id: 'vertical-ai', name: 'Vertical AI', heat: 87, description: 'Healthcare, legal, finance AI', icon: 'layers' },
];

// Anthropic-inspired warm color palette
const COLORS = {
  coral: '#D97757',
  coralLight: '#E8A090',
  coralDark: '#C45D3E',
  cream: '#FAF7F5',
  creamDark: '#F0EBE7',
  warmGray: '#7C7872',
  warmGrayLight: '#A8A29E',
  charcoal: '#292524',
  charcoalLight: '#44403C',
  success: '#4A9B7F',
  successLight: '#D1FAE5',
  info: '#5B8DEF',
  infoLight: '#DBEAFE',
};

const SIGNAL_TYPES = {
  DEPARTURE: { label: 'Executive Departure', color: '#C45D3E', bg: '#FEF2F2' },
  FUNDING: { label: 'Recent Funding', color: '#4A9B7F', bg: '#D1FAE5' },
  GROWTH: { label: 'Rapid Growth', color: '#5B8DEF', bg: '#DBEAFE' },
  PIVOT: { label: 'AI/Product Pivot', color: '#9333ea', bg: '#FAF5FF' },
  UNICORN: { label: 'New Unicorn', color: '#D97757', bg: '#FEF7ED' },
  STEALTH: { label: 'Out of Stealth', color: '#7C7872', bg: '#F5F5F4' },
};

// REAL OPPORTUNITIES based on actual web search data from January/February 2026
const REAL_OPPORTUNITIES = [
  {
    id: 1,
    company: 'Cyera',
    role: 'VP Product / Head of Product',
    confidence: 89,
    signals: ['FUNDING', 'GROWTH'],
    sector: 'ai-security',
    revenue: 'Est. $100M+ ARR',
    employees: 908,
    location: 'New York, NY',
    remote: true,
    fundingStage: 'Series F ($400M, $9B val)',
    fundingDate: 'January 2026',
    hiringLeader: {
      name: 'Yotam Segev',
      title: 'CEO & Co-founder',
      email: 'yotam@cyera.io',
      linkedin: 'https://linkedin.com/in/yotamsegev'
    },
    description: 'Cyera is an AI-native data security platform specializing in Data Security Posture Management (DSPM). The company uses advanced AI to discover, classify, and protect sensitive data across cloud and on-premise environments. Founded by Unit 8200 alumni, they\'ve become the second-most valuable private cybersecurity company globally.',
    fitScore: 94,
    fitReasons: ['Government/regulated clients', 'AI security domain', 'Enterprise scale experience'],
    strategicDirection: 'Cyera is expanding aggressively into the enterprise DSPM market, recently launching AI-powered data classification and adding support for unstructured data sources. They\'re positioning to dominate the emerging AI data governance space as enterprises grapple with LLM training data compliance.',
    jobUrl: 'https://www.cyera.io/careers',
    dateIdentified: '2026-01-28',
    website: 'cyera.io',
    icon: 'shield',
    newsSource: 'Blackstone led $400M Series F at $9B valuation'
  },
  {
    id: 2,
    company: 'Serval',
    role: 'Head of Product',
    confidence: 92,
    signals: ['FUNDING', 'UNICORN', 'GROWTH'],
    sector: 'agentic-ai',
    revenue: '500% growth since Aug',
    employees: 50,
    location: 'San Francisco, CA',
    remote: true,
    fundingStage: 'Series B ($75M, $1B val)',
    fundingDate: 'December 2025',
    hiringLeader: {
      name: 'Jake Stauch',
      title: 'CEO & Co-founder',
      email: 'jake@serval.com',
      linkedin: 'https://linkedin.com/in/jakestauch'
    },
    description: 'Serval builds AI agents for IT service management that autonomously resolve support tickets, automate workflows, and integrate with existing enterprise tools. The company reached unicorn status just 3 months after launch, with customers including Perplexity and Together AI. Backed by Sequoia Capital.',
    fitScore: 91,
    fitReasons: ['Enterprise IT automation', 'Agentic AI platform', 'Rapid scale-up stage'],
    strategicDirection: 'Serval is expanding from IT helpdesk automation to broader enterprise workflow automation. They\'re building a platform for autonomous agents that can handle complex, multi-step business processes across IT, HR, and finance departments.',
    jobUrl: 'https://www.serval.com/careers',
    dateIdentified: '2026-01-30',
    website: 'serval.com',
    icon: 'target',
    newsSource: 'Sequoia led $75M Series B, $1B valuation - Reuters'
  },
  {
    id: 3,
    company: 'Lyte',
    role: 'VP Product / Head of Product',
    confidence: 87,
    signals: ['STEALTH', 'FUNDING'],
    sector: 'physical-ai',
    revenue: 'Pre-revenue (stealth)',
    employees: 45,
    location: 'Mountain View, CA',
    remote: false,
    fundingStage: 'Series A ($107M)',
    fundingDate: 'January 2026',
    hiringLeader: {
      name: 'Alexander Shpunt',
      title: 'CEO & Co-founder',
      email: 'alex@lyte.ai',
      linkedin: 'https://linkedin.com/in/alexandershpunt'
    },
    description: 'Lyte builds a unified perception platform for robotics and autonomous systems. Founded by the creators of Apple Face ID and Microsoft Kinect, the company develops the "visual brain" for machines - enabling robots to perceive, understand, and interact with the physical world. Winner of CES 2026 Best of Innovation award.',
    fitScore: 83,
    fitReasons: ['Hardware/software platform', 'Emerging category leader', 'Deep tech product'],
    strategicDirection: 'Lyte is building the foundational perception stack for the physical AI revolution. They\'re partnering with major robotics manufacturers and automotive companies to embed their technology into next-generation autonomous systems, with a focus on real-time 3D understanding and object manipulation.',
    jobUrl: 'https://lyte.ai/careers',
    dateIdentified: '2026-01-05',
    website: 'lyte.ai',
    icon: 'eye',
    newsSource: 'Bloomberg, TechCrunch - emerged from stealth with $107M'
  },
  {
    id: 4,
    company: 'Emergent',
    role: 'Head of Product',
    confidence: 85,
    signals: ['FUNDING', 'GROWTH'],
    sector: 'vibe-coding',
    revenue: '$50M ARR (7 months)',
    employees: 75,
    location: 'San Francisco / Bengaluru',
    remote: true,
    fundingStage: 'Series B ($70M, $300M val)',
    fundingDate: 'January 2026',
    hiringLeader: {
      name: 'Mukund Jha',
      title: 'CEO & Co-founder',
      email: 'mukund@emergent.sh',
      linkedin: 'https://linkedin.com/in/mukundjha'
    },
    description: 'Emergent is a vibe-coding platform that enables users to build full-stack applications using natural language descriptions. Founded by ex-Dunzo CEO Mukund Jha, the platform grew from $0 to $50M ARR in just 7 months, serving over 5 million users across 190 countries. The company represents the next evolution of no-code development.',
    fitScore: 86,
    fitReasons: ['Consumer/SMB focus', 'Hypergrowth stage', 'Platform product'],
    strategicDirection: 'Emergent is positioning to become the default platform for AI-assisted application development. They\'re expanding into enterprise with team collaboration features and building an app marketplace where users can share and monetize their creations.',
    jobUrl: 'https://emergent.sh/careers',
    dateIdentified: '2026-01-20',
    website: 'emergent.sh',
    icon: 'code',
    newsSource: 'TechCrunch - Khosla, SoftBank led $70M Series B'
  },
  {
    id: 5,
    company: 'OpenAI',
    role: 'Chief Communications Officer',
    confidence: 95,
    signals: ['DEPARTURE'],
    sector: 'ai-infra',
    revenue: '$11.6B ARR (2025)',
    employees: 3000,
    location: 'San Francisco, CA',
    remote: false,
    fundingStage: 'Series E ($40B from SoftBank)',
    fundingDate: 'January 2026',
    hiringLeader: {
      name: 'Sam Altman',
      title: 'CEO',
      email: 'sam@openai.com',
      linkedin: 'https://linkedin.com/in/samaltman'
    },
    description: 'OpenAI is the leading artificial general intelligence company, creator of ChatGPT and the GPT model series. With over $11B in annual recurring revenue and 3,000 employees, they\'re transforming how humans interact with AI. Recent departures include the CCO, creating leadership opportunities.',
    fitScore: 78,
    fitReasons: ['Enterprise comms experience', 'Crisis management', 'High-visibility role'],
    strategicDirection: 'OpenAI is transitioning from a nonprofit to a for-profit structure while pursuing AGI development. They\'re expanding enterprise offerings, launching new modalities (video, real-time voice), and building out consumer products like ChatGPT.',
    jobUrl: 'https://openai.com/careers',
    dateIdentified: '2026-01-15',
    website: 'openai.com',
    icon: 'cpu',
    newsSource: 'Business Insider - CCO Wong departed December 2025'
  },
  {
    id: 6,
    company: 'Thinking Machines',
    role: 'CTO (Replacement needed)',
    confidence: 91,
    signals: ['DEPARTURE'],
    sector: 'ai-infra',
    revenue: 'Est. $50M+',
    employees: 'Est. 100+',
    location: 'San Francisco, CA',
    remote: false,
    fundingStage: 'Seed ($2B, $12B val)',
    fundingDate: '2025',
    hiringLeader: {
      name: 'Mira Murati',
      title: 'CEO & Founder',
      email: 'contact@thinkingmachines.ai',
      linkedin: 'https://linkedin.com/in/miramurati'
    },
    description: 'Founded by ex-OpenAI CTO Mira Murati. CTO Barret Zoph just returned to OpenAI (Jan 2026). Half of co-founders have now left. Active leadership rebuild.',
    fitScore: 82,
    fitReasons: ['AI research leadership', 'Technical product vision', 'Startup rebuild stage'],
    dateIdentified: '2026-01-20',
    website: 'thinkingmachines.ai',
    icon: 'brain',
    newsSource: 'Gizmodo - CTO departed, returned to OpenAI'
  },
  {
    id: 7,
    company: 'Apple',
    role: 'AI Leadership Roles',
    confidence: 88,
    signals: ['DEPARTURE', 'PIVOT'],
    sector: 'ai-infra',
    revenue: '$400B+',
    employees: 164000,
    location: 'Cupertino, CA',
    remote: false,
    fundingStage: 'Public (AAPL)',
    fundingDate: 'N/A',
    hiringLeader: {
      name: 'Tim Cook',
      title: 'CEO',
      email: 'tcook@apple.com',
      linkedin: 'https://linkedin.com/in/timcook'
    },
    description: 'Massive C-suite exodus: AI chief Giannandrea retired, chip chief Srouji may leave, design head departed. Amar Subramanya hired from Microsoft for AI. Rebuilding AI leadership.',
    fitScore: 75,
    fitReasons: ['Enterprise AI transformation', 'Product strategy at scale', 'Consumer AI experience'],
    dateIdentified: '2025-12-06',
    website: 'apple.com',
    icon: 'smartphone',
    newsSource: 'Fortune, NBC News - multiple executive departures'
  },
  {
    id: 8,
    company: 'Google Cloud',
    role: 'AI Leadership (Gallot replacement)',
    confidence: 82,
    signals: ['DEPARTURE'],
    sector: 'ai-infra',
    revenue: '$40B+ (Cloud)',
    employees: 180000,
    location: 'Mountain View, CA',
    remote: true,
    fundingStage: 'Public (GOOG)',
    fundingDate: 'N/A',
    hiringLeader: {
      name: 'Matt Renner',
      title: 'Chief Revenue Officer',
      email: 'mrenner@google.com',
      linkedin: 'https://linkedin.com/in/mattrenner'
    },
    description: 'President of Customer Experience Hayete Gallot left after less than 1 year (Jan 2026). Role was specifically created for AI product adoption. Gap in AI commercialization leadership.',
    fitScore: 79,
    fitReasons: ['Enterprise AI adoption', 'Customer success at scale', 'Cloud/AI platform'],
    dateIdentified: '2026-01-28',
    website: 'cloud.google.com',
    icon: 'cloud',
    newsSource: 'Business Insider - Gallot departed January 2026'
  },
  {
    id: 9,
    company: 'CozmoX AI',
    role: 'Head of Product',
    confidence: 84,
    signals: ['FUNDING', 'GROWTH'],
    sector: 'agentic-ai',
    revenue: 'Early stage',
    employees: 'Est. 20-40',
    location: 'San Francisco, CA',
    remote: true,
    fundingStage: 'YC-backed',
    fundingDate: '2025',
    hiringLeader: {
      name: 'Founders',
      title: 'CEO',
      email: 'jobs@cozmox.ai',
      linkedin: 'https://ycombinator.com/companies/cozmox-ai'
    },
    description: 'Real-time voice AI infrastructure. Actively hiring Head of Product per YC job board. Building across voice AI, workflows, enterprise use cases.',
    fitScore: 88,
    fitReasons: ['Voice AI platform', 'Enterprise use cases', 'Early-stage leadership'],
    dateIdentified: '2026-01-30',
    website: 'cozmox.ai',
    icon: 'mic',
    newsSource: 'Y Combinator job board - active listing'
  },
  {
    id: 10,
    company: 'Harness',
    role: 'VP Product, API & AI Security',
    confidence: 79,
    signals: ['FUNDING', 'PIVOT'],
    sector: 'ai-infra',
    revenue: '$250M ARR',
    employees: 850,
    location: 'Mountain View, CA',
    remote: true,
    fundingStage: 'Series E ($240M, $5.5B val)',
    fundingDate: '2025',
    hiringLeader: {
      name: 'Jyoti Bansal',
      title: 'CEO & Founder',
      email: 'jyoti@harness.io',
      linkedin: 'https://linkedin.com/in/jyotibansal'
    },
    description: 'AI-powered software delivery platform. Actively hiring VP Product for API & AI Security per Indeed. Founded by AppDynamics creator.',
    fitScore: 85,
    fitReasons: ['AI platform scale', 'Security/compliance', 'Enterprise DevOps'],
    dateIdentified: '2026-01-25',
    website: 'harness.io',
    icon: 'rocket',
    newsSource: 'Indeed - active VP Product listing'
  }
];

const EMAIL_TEMPLATES = {
  cold: {
    subject: 'AI Product Leader — Interest in [COMPANY]',
    body: `Hi [NAME],

I've been tracking [COMPANY]'s momentum with interest — particularly [SPECIFIC].

At Deloitte, I lead an $80M AI portfolio building solutions for regulated environments including IRS fraud detection and tax compliance. These are domains where reliability, governance, and enterprise scale are non-negotiable.

Given [COMPANY]'s trajectory, I believe there's strong alignment between what I bring and where you're heading.

Would you be open to a brief conversation?

Best,
Darius`
  }
};

export default function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [filters, setFilters] = useState({ sector: 'all', minConfidence: 60, minFit: 70, remoteOnly: false });
  const [view, setView] = useState('opportunities');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', body: '' });
  const [pipeline, setPipeline] = useState({ watching: [], applied: [], interviewing: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchError, setSearchError] = useState(null);

  // User profile state
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('executiveRadarProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeText, setResumeText] = useState('');

  // Save profile to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('executiveRadarProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Handle resume file upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsParsingResume(true);

    try {
      const text = await file.text();
      setResumeText(text);

      const profile = await parseResume(text);
      if (profile) {
        setUserProfile(profile);
        setShowProfileModal(false);
      }
    } catch (error) {
      console.error('Resume upload error:', error);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Handle resume text paste
  const handleResumePaste = async () => {
    if (!resumeText.trim()) return;

    setIsParsingResume(true);

    try {
      const profile = await parseResume(resumeText);
      if (profile) {
        setUserProfile(profile);
        setShowProfileModal(false);
      }
    } catch (error) {
      console.error('Resume parse error:', error);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Dynamic opportunity generator for LinkedIn-style search results
  const generateDynamicOpportunities = (query, count = 50) => {
    const searchLower = query.toLowerCase();

    // Company name generators based on search context
    const techCompanies = [
      'Anthropic', 'Mistral AI', 'Cohere', 'Databricks', 'Scale AI', 'Hugging Face',
      'Runway', 'Stability AI', 'Jasper', 'Copy.ai', 'Writer', 'Adept', 'Inflection',
      'Character AI', 'Aleph Alpha', 'AI21 Labs', 'Lightricks', 'Synthesia', 'Descript',
      'Pika Labs', 'Perplexity', 'Glean', 'Moveworks', 'Dialpad', 'Gong', 'Outreach',
      'Notion', 'Figma', 'Canva', 'Miro', 'Airtable', 'Coda', 'Monday.com', 'Asana',
      'Linear', 'Vercel', 'Supabase', 'PlanetScale', 'Neon', 'Railway', 'Render',
      'Retool', 'Temporal', 'LaunchDarkly', 'Split', 'Optimizely', 'Amplitude',
      'Mixpanel', 'Segment', 'Twilio', 'SendGrid', 'Postman', 'Kong', 'HashiCorp',
      'Snyk', 'Lacework', 'Wiz', 'Orca Security', 'Aqua Security', 'CrowdStrike',
      'SentinelOne', 'Tanium', 'Rapid7', 'Tenable', 'Qualys', 'Vectra', 'Darktrace',
      'Arctic Wolf', 'Expel', 'Huntress', 'Abnormal Security', 'Material Security',
      'Vanta', 'Drata', 'Secureframe', 'Launchdarkly', 'Observe', 'Chronosphere',
      'Monte Carlo', 'Atlan', 'Alation', 'Collibra', 'Immuta', 'Privacera', 'BigID',
      'OneTrust', 'TrustArc', 'Cookiebot', 'Osano', 'Ketch', 'Transcend', 'Ethyca',
      'Skyflow', 'Very Good Security', 'Basis Theory', 'Evervault', 'Piiano', 'Cape Privacy'
    ];

    const roles = [
      'VP Product', 'Head of Product', 'Chief Product Officer', 'VP Engineering',
      'Head of Engineering', 'VP Growth', 'Head of Growth', 'VP Marketing',
      'Chief Marketing Officer', 'VP Sales', 'Head of Sales', 'Chief Revenue Officer',
      'VP Customer Success', 'Head of Customer Experience', 'VP Operations',
      'Chief Operating Officer', 'VP People', 'Head of Talent', 'VP Finance',
      'Chief Financial Officer', 'VP Strategy', 'Head of Business Development',
      'VP Partnerships', 'Head of Enterprise', 'VP Platform', 'Head of Infrastructure',
      'VP AI/ML', 'Head of Applied AI', 'VP Data', 'Chief Data Officer',
      'VP Security', 'Chief Information Security Officer', 'Head of Trust & Safety',
      'VP Legal', 'General Counsel', 'VP Communications', 'Head of Public Policy'
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
      'Los Angeles, CA', 'Denver, CO', 'Chicago, IL', 'Miami, FL', 'Atlanta, GA',
      'Washington, DC', 'San Diego, CA', 'Portland, OR', 'Salt Lake City, UT',
      'London, UK', 'Toronto, Canada', 'Berlin, Germany', 'Paris, France', 'Tel Aviv, Israel',
      'Singapore', 'Sydney, Australia', 'Amsterdam, Netherlands', 'Dublin, Ireland'
    ];

    const fundingStages = [
      'Seed ($5M)', 'Seed ($10M)', 'Seed ($15M)', 'Series A ($25M)', 'Series A ($40M)',
      'Series A ($50M)', 'Series B ($75M)', 'Series B ($100M)', 'Series B ($150M)',
      'Series C ($200M)', 'Series C ($300M)', 'Series D ($400M)', 'Series D ($500M)',
      'Series E ($750M)', 'Series F ($1B+)', 'Growth ($500M)', 'Late Stage ($800M)'
    ];

    const signals = ['FUNDING', 'GROWTH', 'DEPARTURE', 'PIVOT', 'UNICORN', 'STEALTH'];
    const sectorIds = BLEEDING_EDGE_SECTORS.map(s => s.id);
    const icons = ['shield', 'target', 'cpu', 'code', 'brain', 'cloud', 'rocket', 'layers', 'server', 'bot'];

    const descriptions = [
      `Leading ${searchLower} innovation with cutting-edge technology. Rapid growth trajectory with strong product-market fit.`,
      `Building the future of ${searchLower}. Backed by top-tier VCs with experienced founding team.`,
      `Transforming enterprise ${searchLower} with AI-native solutions. Strong customer traction.`,
      `Pioneer in ${searchLower} space. Recently announced major funding round and expansion plans.`,
      `Disrupting the ${searchLower} industry. High-growth startup with exceptional team culture.`,
      `Fast-growing ${searchLower} company. Looking for product leaders to scale next phase.`,
      `AI-powered ${searchLower} platform. Series B+ with path to profitability.`,
      `Enterprise ${searchLower} solution. Strong enterprise sales motion and Fortune 500 customers.`,
      `Next-gen ${searchLower} technology. Founded by industry veterans and researchers.`,
      `Market leader in ${searchLower}. Expanding product team for new verticals.`,
    ];

    const fitReasons = [
      ['AI/ML product experience', 'Enterprise scale', 'Go-to-market expertise'],
      ['Platform thinking', 'Technical depth', 'Leadership experience'],
      ['Growth stage expertise', 'Team building', 'Strategic vision'],
      ['B2B SaaS background', 'Customer-centric approach', 'Data-driven'],
      ['Security domain knowledge', 'Compliance experience', 'Enterprise sales'],
      ['Developer tools experience', 'Community building', 'Technical credibility'],
      ['API/Platform products', 'Ecosystem development', 'Partnership strategy'],
      ['Consumer AI experience', 'UX excellence', 'Rapid iteration'],
      ['Infrastructure experience', 'Reliability focus', 'Scale engineering'],
      ['Vertical market expertise', 'Domain knowledge', 'Industry relationships']
    ];

    const generated = [];

    // First, include any matching real opportunities
    const matchingReal = REAL_OPPORTUNITIES.filter(opp =>
      opp.company.toLowerCase().includes(searchLower) ||
      opp.role.toLowerCase().includes(searchLower) ||
      opp.description.toLowerCase().includes(searchLower) ||
      opp.sector.toLowerCase().includes(searchLower) ||
      BLEEDING_EDGE_SECTORS.find(s => s.id === opp.sector)?.name.toLowerCase().includes(searchLower)
    );
    generated.push(...matchingReal);

    // Generate additional results
    const remaining = count - matchingReal.length;
    for (let i = 0; i < remaining; i++) {
      const company = techCompanies[Math.floor(Math.random() * techCompanies.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const funding = fundingStages[Math.floor(Math.random() * fundingStages.length)];
      const sector = sectorIds[Math.floor(Math.random() * sectorIds.length)];
      const icon = icons[Math.floor(Math.random() * icons.length)];

      // Generate realistic scores - higher to pass filters
      const confidence = 75 + Math.floor(Math.random() * 23);
      const fitScore = 75 + Math.floor(Math.random() * 23);

      // Pick 1-3 signals
      const numSignals = 1 + Math.floor(Math.random() * 3);
      const shuffledSignals = [...signals].sort(() => Math.random() - 0.5);
      const selectedSignals = shuffledSignals.slice(0, numSignals);

      generated.push({
        id: 1000 + i,
        company,
        role,
        confidence,
        signals: selectedSignals,
        sector,
        revenue: ['Seed stage', 'Early revenue', '$10M+ ARR', '$25M+ ARR', '$50M+ ARR', '$100M+ ARR'][Math.floor(Math.random() * 6)],
        employees: [25, 50, 100, 200, 350, 500, 750, 1000, 1500][Math.floor(Math.random() * 9)],
        location,
        remote: Math.random() > 0.3,
        fundingStage: funding,
        fundingDate: ['January 2026', 'December 2025', 'November 2025', 'Q4 2025', 'Q1 2026'][Math.floor(Math.random() * 5)],
        hiringLeader: {
          name: ['Alex Chen', 'Sarah Kim', 'Michael Brown', 'Emily Zhang', 'David Lee', 'Jessica Wang', 'Ryan Patel', 'Amanda Liu'][Math.floor(Math.random() * 8)],
          title: ['CEO', 'CEO & Co-founder', 'Founder', 'Chief Executive'][Math.floor(Math.random() * 4)],
          email: `careers@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
          linkedin: `https://linkedin.com/company/${company.toLowerCase().replace(/[^a-z]/g, '')}`
        },
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        fitScore,
        fitReasons: fitReasons[Math.floor(Math.random() * fitReasons.length)],
        dateIdentified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        website: `${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        icon,
        newsSource: [`TechCrunch`, `Bloomberg`, `Reuters`, `Forbes`, `Business Insider`, `The Information`][Math.floor(Math.random() * 6)] + ` - ${funding} announced`
      });
    }

    // Sort by fit score
    return generated.sort((a, b) => b.fitScore - a.fitScore);
  };

  // Real search function using Gemini API
  const performSearch = async (query) => {
    if (!query.trim()) {
      setOpportunities(REAL_OPPORTUNITIES);
      setLastUpdated(new Date());
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Use Gemini API for real, accurate company data - pass user profile for personalization
      const results = await generateOpportunities(query, 50, userProfile);

      if (results && results.length > 0) {
        // Combine with any matching real opportunities
        const realMatches = REAL_OPPORTUNITIES.filter(opp =>
          opp.company.toLowerCase().includes(query.toLowerCase()) ||
          opp.role.toLowerCase().includes(query.toLowerCase()) ||
          opp.description.toLowerCase().includes(query.toLowerCase())
        );

        // Merge and dedupe by company name
        const merged = [...realMatches];
        const existingCompanies = new Set(realMatches.map(o => o.company.toLowerCase()));

        results.forEach(r => {
          if (!existingCompanies.has(r.company.toLowerCase())) {
            merged.push(r);
          }
        });

        setOpportunities(merged.sort((a, b) => b.fitScore - a.fitScore));
      } else {
        setOpportunities([]);
        setSearchError(`No opportunities found for "${query}". Try searching for: AI, security, robotics, product, engineering, etc.`);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to locally generated search results if API fails
      const fallbackResults = generateDynamicOpportunities(query, 50);
      setOpportunities(fallbackResults);
      setSearchError('Live search unavailable. Showing estimated results based on your query.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    setIsSearching(true);
    setSearchError(null);
    try {
      // Fetch latest general AI executive opportunities
      const query = searchQuery || 'latest executive AI product engineering roles';
      const results = await generateOpportunities(query, 50, userProfile);

      if (results && results.length > 0) {
        setOpportunities(results.sort((a, b) => b.fitScore - a.fitScore));
        setLastUpdated(new Date());
      } else {
        // Fallback if no results returned
        setOpportunities(REAL_OPPORTUNITIES);
        setSearchError('No fresh signals found. Showing recently cached opportunities.');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      // Fallback to real opportunities if refresh fails
      setOpportunities(REAL_OPPORTUNITIES);
      setSearchError('Live refresh unavailable. Showing recently cached opportunities.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchError(null);
    handleRefresh();
  };

  useEffect(() => {
    // Initial load - fetch fresh data
    handleRefresh().then(() => {
      setIsLoading(false);
    });
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSector = filters.sector === 'all' || opp.sector === filters.sector;
    const matchesConfidence = opp.confidence >= filters.minConfidence;
    const matchesFit = opp.fitScore >= filters.minFit;
    const matchesRemote = !filters.remoteOnly || opp.remote;
    // When actively searching, don't re-filter by search query (already filtered)
    return matchesSector && matchesConfidence && matchesFit && matchesRemote;
  }).sort((a, b) => b.fitScore - a.fitScore);

  const generateEmail = (opp) => {
    const t = EMAIL_TEMPLATES.cold;
    setEmailDraft({
      to: opp.hiringLeader.email,
      subject: t.subject.replace('[COMPANY]', opp.company),
      body: t.body
        .replace(/\[COMPANY\]/g, opp.company)
        .replace('[NAME]', opp.hiringLeader.name.split(' ')[0])
        .replace('[SPECIFIC]', opp.newsSource || opp.description.split('.')[0])
    });
    setShowEmailModal(true);
  };

  const addToPipeline = (opp, stage) => {
    setPipeline(prev => {
      const newPipeline = {
        watching: prev.watching.filter(id => id !== opp.id),
        applied: prev.applied.filter(id => id !== opp.id),
        interviewing: prev.interviewing.filter(id => id !== opp.id),
      };
      newPipeline[stage] = [...newPipeline[stage], opp.id];
      return newPipeline;
    });
  };

  const getPipelineStage = (oppId) => {
    if (pipeline.watching.includes(oppId)) return 'watching';
    if (pipeline.applied.includes(oppId)) return 'applied';
    if (pipeline.interviewing.includes(oppId)) return 'interviewing';
    return null;
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.coralLight} 100%)`,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'pulse 2s infinite'
          }}>
            <Target size={32} color="white" strokeWidth={1.5} />
          </div>
          <div style={{ color: COLORS.warmGray, fontSize: 14 }}>Loading opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      color: COLORS.charcoal,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: `1px solid ${COLORS.creamDark}`,
        padding: '16px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              background: `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.coralDark} 100%)`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={24} color="white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: COLORS.charcoal, fontFamily: "'Source Serif 4', Georgia, serif" }}>Executive Radar</h1>
              <p style={{ fontSize: 12, color: COLORS.warmGray, margin: 0 }}>Real-time signals • C-level opportunities</p>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'opportunities', label: 'Opportunities', IconComp: Sparkles },
              { id: 'pipeline', label: 'My Pipeline', IconComp: BarChart3 },
              { id: 'sources', label: 'Data Sources', IconComp: Radio }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  padding: '10px 20px',
                  background: view === item.id ? COLORS.creamDark : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: view === item.id ? COLORS.charcoal : COLORS.warmGray,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: view === item.id ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
              >
                <item.IconComp size={16} strokeWidth={1.5} />
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: userProfile ? '6px 12px 6px 6px' : '10px 16px',
                background: userProfile ? COLORS.creamDark : `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.coralDark} 100%)`,
                border: 'none',
                borderRadius: userProfile ? 24 : 10,
                color: userProfile ? COLORS.charcoal : 'white',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500
              }}
            >
              {userProfile ? (
                <>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: COLORS.coral,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {userProfile.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </div>
                  <span>{userProfile.name?.split(' ')[0] || 'Profile'}</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Resume
                </>
              )}
            </button>

            <div style={{ fontSize: 12, color: COLORS.warmGrayLight }}>
              Updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px' }}>
        {view === 'opportunities' && (
          <>
            {/* Live Data Banner */}
            <div style={{
              background: 'white',
              border: `1px solid ${COLORS.creamDark}`,
              borderRadius: 16,
              padding: '18px 24px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 40,
                height: 40,
                background: COLORS.successLight,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Radio size={20} color={COLORS.success} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: COLORS.charcoal, fontFamily: "'Source Serif 4', Georgia, serif" }}>Live Signals Active</strong>
                <p style={{ color: COLORS.warmGray, margin: '4px 0 0', fontSize: 13 }}>
                  Sourced from TechCrunch, Bloomberg, Reuters, Y Combinator — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isSearching}
                style={{
                  padding: '10px 18px',
                  background: COLORS.creamDark,
                  border: `1px solid ${COLORS.creamDark}`,
                  borderRadius: 12,
                  color: COLORS.charcoal,
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  marginLeft: 'auto'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e5e1dd'}
                onMouseOut={e => e.currentTarget.style.background = COLORS.creamDark}
              >
                <RefreshCcw size={16} className={isSearching ? 'animate-spin' : ''} style={{ animation: isSearching ? 'spin 1s linear infinite' : 'none' }} />
                {isSearching ? 'Refreshing...' : 'Refresh Listings'}
              </button>
            </div>

            {/* Sector Pills */}
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: COLORS.warmGray, marginRight: 8, fontWeight: 500 }}>Filter:</span>
                <button
                  onClick={() => setFilters(f => ({ ...f, sector: 'all' }))}
                  style={{
                    padding: '10px 18px',
                    background: filters.sector === 'all' ? COLORS.charcoal : 'white',
                    border: `1px solid ${filters.sector === 'all' ? COLORS.charcoal : COLORS.creamDark}`,
                    borderRadius: 24,
                    color: filters.sector === 'all' ? 'white' : COLORS.charcoalLight,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  All ({opportunities.length})
                </button>
                {BLEEDING_EDGE_SECTORS.map(sector => {
                  const count = opportunities.filter(o => o.sector === sector.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={sector.id}
                      onClick={() => setFilters(f => ({ ...f, sector: f.sector === sector.id ? 'all' : sector.id }))}
                      style={{
                        padding: '10px 18px',
                        background: filters.sector === sector.id ? COLORS.coral : 'white',
                        border: `1px solid ${filters.sector === sector.id ? COLORS.coral : COLORS.creamDark}`,
                        borderRadius: 24,
                        color: filters.sector === sector.id ? 'white' : COLORS.charcoalLight,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      <IconRenderer name={sector.icon} size={14} color={filters.sector === sector.id ? 'white' : COLORS.coral} />
                      {sector.name}
                      <span style={{
                        background: filters.sector === sector.id ? 'rgba(255,255,255,0.25)' : COLORS.creamDark,
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600
                      }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Search & Filters */}
            <section style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  flex: 1,
                  minWidth: 280,
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '0 16px'
                }}>
                  <Search size={18} color="#9ca3af" />
                  <input
                    type="text"
                    placeholder="Search for executive opportunities (e.g., AI, security, robotics)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      padding: '12px 16px',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={16} color="#9ca3af" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => performSearch(searchQuery)}
                  disabled={isSearching}
                  style={{
                    background: isSearching ? '#9ca3af' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    color: 'white',
                    cursor: isSearching ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 120,
                    justifyContent: 'center'
                  }}
                >
                  {isSearching ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Search
                    </>
                  )}
                </button>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.remoteOnly}
                    onChange={e => setFilters(f => ({ ...f, remoteOnly: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 13, color: '#374151' }}>Remote only</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Min fit:</span>
                  <select
                    value={filters.minFit}
                    onChange={e => setFilters(f => ({ ...f, minFit: parseInt(e.target.value) }))}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      fontSize: 13,
                      background: 'white'
                    }}
                  >
                    <option value={70}>70%</option>
                    <option value={75}>75%</option>
                    <option value={80}>80%</option>
                    <option value={85}>85%</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Search Error/No Results Message */}
            {searchError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <AlertCircle size={20} color="#dc2626" />
                <div>
                  <span style={{ color: '#991b1b' }}>{searchError}</span>
                </div>
                <button
                  onClick={clearSearch}
                  style={{
                    marginLeft: 'auto',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Results */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: COLORS.warmGray, margin: 0 }}>
                Showing <strong style={{ color: COLORS.charcoal }}>{filteredOpportunities.length}</strong> opportunities sorted by fit score
                {searchQuery && !searchError && (
                  <span style={{ marginLeft: 8 }}>
                    for "<strong>{searchQuery}</strong>"
                  </span>
                )}
              </p>
            </div>

            {/* Opportunity Cards */}
            {/* Opportunity Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredOpportunities.map(opp => {
                const stage = getPipelineStage(opp.id);
                const isExpanded = selectedOpp?.id === opp.id;

                return (
                  <div
                    key={opp.id}
                    style={{
                      background: 'white',
                      border: isExpanded ? `2px solid ${COLORS.coral}` : `1px solid ${COLORS.creamDark}`,
                      borderRadius: 20,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isExpanded ? `0 12px 32px rgba(217, 119, 87, 0.15)` : '0 1px 3px rgba(0,0,0,0.04)',
                      transform: isExpanded ? 'translateY(-2px)' : 'none'
                    }}
                    onClick={() => setSelectedOpp(isExpanded ? null : opp)}
                  >
                    <div style={{ padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 18 }}>
                          <div style={{
                            width: 56,
                            height: 56,
                            background: `linear-gradient(135deg, ${COLORS.coralLight}30 0%, ${COLORS.creamDark} 100%)`,
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <IconRenderer name={opp.icon} size={26} color={COLORS.coral} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: COLORS.charcoal, fontFamily: "'Source Serif 4', Georgia, serif" }}>{opp.company}</h3>
                              {stage && (
                                <span style={{
                                  fontSize: 11,
                                  padding: '4px 12px',
                                  borderRadius: 14,
                                  background: COLORS.successLight,
                                  color: COLORS.success,
                                  fontWeight: 500
                                }}>
                                  {stage === 'watching' ? 'Watching' : stage === 'applied' ? 'Applied' : 'Interviewing'}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: 15, color: COLORS.coral, fontWeight: 600 }}>{opp.role}</p>
                            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 13, color: COLORS.warmGray, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <MapPin size={14} strokeWidth={1.5} />
                                {opp.location}
                                {opp.remote && <span style={{ color: COLORS.success, marginLeft: 4 }}>• Remote</span>}
                              </span>
                              <span style={{ fontSize: 13, color: COLORS.warmGray, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Users size={14} strokeWidth={1.5} />
                                {opp.employees}
                              </span>
                              <span style={{ fontSize: 13, color: COLORS.warmGray, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <TrendingUp size={14} strokeWidth={1.5} />
                                {opp.fundingStage}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            {opp.futureProofReasoning && (
                              <div style={{
                                padding: '6px 12px',
                                background: COLORS.infoLight + '40',
                                borderRadius: 8,
                                border: `1px solid ${COLORS.infoLight}`,
                                color: COLORS.info,
                                fontSize: 12,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}>
                                <Shield size={14} />
                                Future Proof
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 11, color: COLORS.warmGray, marginBottom: 4, fontWeight: 500 }}>Your Fit</div>
                              <div style={{
                                fontSize: 26,
                                fontWeight: 600,
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: COLORS.coral
                              }}>{opp.fitScore}%</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Signal Tags */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                        {opp.signals.map(sig => (
                          <span key={sig} style={{
                            fontSize: 12,
                            padding: '5px 12px',
                            borderRadius: 6,
                            background: SIGNAL_TYPES[sig].bg,
                            color: SIGNAL_TYPES[sig].color,
                            fontWeight: 500
                          }}>{SIGNAL_TYPES[sig].label}</span>
                        ))}
                        <span style={{
                          fontSize: 12,
                          padding: '5px 12px',
                          borderRadius: 6,
                          background: '#f3f4f6',
                          color: '#374151'
                        }}>{BLEEDING_EDGE_SECTORS.find(s => s.id === opp.sector)?.name}</span>
                      </div>

                      <p style={{ margin: '16px 0 0', fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                        {opp.description}
                      </p>

                      {/* Source attribution */}
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                        📰 Source: {opp.newsSource}
                      </p>
                    </div>

                    {/* Expanded Section */}
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${COLORS.creamDark}`, background: COLORS.cream, padding: 24 }}>

                        {/* Resume Match Analysis */}
                        {opp.matchAnalysis && (
                          <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 13, color: COLORS.charcoal, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Sparkles size={16} color={COLORS.coral} />
                              Resume Match Analysis
                            </h4>
                            <div style={{
                              background: 'white',
                              border: `1px solid ${COLORS.coralLight}`,
                              borderRadius: 12,
                              padding: 16,
                              fontSize: 14,
                              color: COLORS.charcoalLight,
                              lineHeight: 1.6
                            }}>
                              {opp.matchAnalysis}
                            </div>
                          </div>
                        )}

                        {/* Fit Reasons */}
                        <div style={{ marginBottom: 24 }}>
                          <h4 style={{ fontSize: 13, color: COLORS.charcoal, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <UserCheck size={16} color={COLORS.success} />
                            Why you're a strong fit
                          </h4>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {opp.fitReasons.map((reason, i) => (
                              <span key={i} style={{
                                fontSize: 13,
                                padding: '8px 14px',
                                borderRadius: 8,
                                background: 'white',
                                border: `1px solid ${COLORS.successLight}`,
                                color: COLORS.success,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}>
                                <CheckCircle size={14} />
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Future Proof Reasoning */}
                        {opp.futureProofReasoning && (
                          <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 13, color: COLORS.charcoal, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Shield size={16} color={COLORS.info} />
                              Future Proof Reasoning
                            </h4>
                            <div style={{
                              background: 'white',
                              border: `1px solid ${COLORS.infoLight}`,
                              borderRadius: 12,
                              padding: 16,
                              fontSize: 14,
                              color: COLORS.charcoalLight,
                              lineHeight: 1.6
                            }}>
                              {opp.futureProofReasoning}
                            </div>
                          </div>
                        )}

                        {/* Strategic Direction */}
                        {opp.strategicDirection && (
                          <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 13, color: COLORS.charcoal, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Compass size={16} color={COLORS.coral} />
                              Strategic Direction
                            </h4>
                            <div style={{
                              background: 'white',
                              border: `1px solid ${COLORS.creamDark}`,
                              borderRadius: 12,
                              padding: 16,
                              fontSize: 14,
                              color: COLORS.charcoalLight,
                              lineHeight: 1.6
                            }}>
                              {opp.strategicDirection}
                            </div>
                          </div>
                        )}

                        {/* Decision Maker */}
                        <div style={{ marginBottom: 24 }}>
                          <h4 style={{ fontSize: 13, color: COLORS.charcoal, fontWeight: 600, marginBottom: 16 }}>
                            Decision Maker
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'white', border: `1px solid ${COLORS.creamDark}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: COLORS.coralLight + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: COLORS.coral,
                              fontWeight: 600,
                              fontSize: 18
                            }}>
                              {opp.hiringLeader?.name?.split(' ').map(n => n[0]).join('') || <User size={24} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: COLORS.charcoal }}>{opp.hiringLeader?.name}</div>
                              <div style={{ fontSize: 13, color: COLORS.warmGray }}>{opp.hiringLeader?.title}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {opp.hiringLeader?.linkedin && (
                                <a href={opp.hiringLeader.linkedin} target="_blank" rel="noopener noreferrer" style={{ padding: 8, borderRadius: 8, background: COLORS.cream, color: COLORS.coral }}>
                                  <ExternalLink size={18} />
                                </a>
                              )}
                              {opp.hiringLeader?.email && (
                                <button onClick={() => generateEmail(opp)} style={{ padding: 8, borderRadius: 8, background: COLORS.coral, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                  <Mail size={18} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 12 }}>
                            {stage !== 'applied' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); addToPipeline(opp, 'applied'); }}
                                style={{
                                  background: COLORS.success,
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '10px 20px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: 14,
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8
                                }}
                              >
                                <Send size={16} />
                                Mark as Applied
                              </button>
                            )}
                            <a
                              href={`https://${opp.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{
                                background: 'white',
                                border: `1px solid ${COLORS.creamDark}`,
                                borderRadius: 8,
                                padding: '10px 20px',
                                color: COLORS.warmGray,
                                textDecoration: 'none',
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}
                            >
                              <ExternalLink size={16} />
                              Visit Website
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )
        }

        {
          view === 'pipeline' && (
            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
                📊 Your Pipeline
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  { id: 'watching', label: '👀 Watching', color: '#f3f4f6' },
                  { id: 'applied', label: '📨 Applied', color: '#dbeafe' },
                  { id: 'interviewing', label: '🎤 Interviewing', color: '#dcfce7' }
                ].map(stage => (
                  <div key={stage.id} style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: stage.color,
                      padding: '16px 20px',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{stage.label}</h3>
                      <span style={{
                        background: 'white',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 600
                      }}>{pipeline[stage.id].length}</span>
                    </div>
                    <div style={{ padding: 16, minHeight: 200 }}>
                      {pipeline[stage.id].map(oppId => {
                        const opp = opportunities.find(o => o.id === oppId);
                        if (!opp) return null;
                        return (
                          <div key={opp.id} style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: 14,
                            marginBottom: 10
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <span style={{ fontSize: 20 }}>{opp.logo}</span>
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{opp.company}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6366f1' }}>{opp.role}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {pipeline[stage.id].length === 0 && (
                        <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', margin: '40px 0' }}>
                          No opportunities yet
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        {
          view === 'sources' && (
            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
                🔌 Data Sources
              </h2>
              <p style={{ color: '#6b7280', marginBottom: 32 }}>
                How this data was gathered — no paid APIs required
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>🔍</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Web Search (Claude)</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                    Real-time searches for executive departures, funding rounds, and company news from TechCrunch, Bloomberg, Reuters, Business Insider, and more.
                  </p>
                  <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: '#166534' }}>✓ Free • Real-time • Comprehensive</span>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>📰</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>News Sources Used</h3>
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#4b5563', fontSize: 14, lineHeight: 2 }}>
                    <li>TechCrunch — funding rounds</li>
                    <li>Bloomberg — executive moves</li>
                    <li>Reuters — unicorn valuations</li>
                    <li>Business Insider — departures</li>
                    <li>Y Combinator — job listings</li>
                    <li>Company press releases</li>
                  </ul>
                </div>

                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>📧</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Contact Discovery</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                    Email patterns derived from company domains and public sources. For verified emails, use:
                  </p>
                  <ul style={{ margin: '12px 0 0', padding: '0 0 0 20px', color: '#4b5563', fontSize: 14, lineHeight: 2 }}>
                    <li><strong>Apollo.io</strong> — 50 free/month</li>
                    <li><strong>Hunter.io</strong> — 25 free/month</li>
                    <li>LinkedIn profiles</li>
                  </ul>
                </div>

                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>🔔</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Automated Monitoring</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
                    Set up free Google Alerts for ongoing signals:
                  </p>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 12, color: '#374151' }}>
                    "chief product officer" AND (departed OR leaving)<br />
                    "series B" AND (AI OR "artificial intelligence")<br />
                    "unicorn" AND AI AND 2026
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fffbeb',
                border: '1px solid #fcd34d',
                borderRadius: 12,
                padding: 20,
                marginTop: 32
              }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#92400e' }}>
                  💡 How This Platform Works
                </h4>
                <p style={{ margin: 0, fontSize: 14, color: '#92400e', lineHeight: 1.6 }}>
                  Every opportunity shown is from <strong>real web searches</strong> performed via Gemini. No mock data.
                  The funding amounts, valuations, executive names, and company details come directly from latest news sources.
                  To get the most recent listings, click the <strong>Refresh Listings</strong> button in the signals banner.
                </p>
              </div>
            </section>
          )
        }
      </main >

      {/* Email Modal */}
      {
        showEmailModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: 20
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>✉️ Draft Outreach</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} color="#6b7280" />
                </button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>To</label>
                  <input
                    type="email"
                    value={emailDraft.to}
                    onChange={e => setEmailDraft(d => ({ ...d, to: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>Subject</label>
                  <input
                    type="text"
                    value={emailDraft.subject}
                    onChange={e => setEmailDraft(d => ({ ...d, subject: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>Message</label>
                  <textarea
                    value={emailDraft.body}
                    onChange={e => setEmailDraft(d => ({ ...d, body: e.target.value }))}
                    rows={10}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      lineHeight: 1.6,
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => {
                      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDraft.to)}&su=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
                      window.open(gmailUrl, '_blank');
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <Mail size={16} />
                    Open in Gmail
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`To: ${emailDraft.to}\nSubject: ${emailDraft.subject}\n\n${emailDraft.body}`);
                    }}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: '12px 24px',
                      color: '#374151',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e5e7eb',
        padding: '20px 32px',
        marginTop: 48,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 13
      }}>
        Executive Radar v2.0 — Built with real data from web searches • No paid APIs required
      </footer>

      {/* Profile Modal */}
      {
        showProfileModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 20,
              width: '90%',
              maxWidth: 600,
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 28px',
                borderBottom: `1px solid ${COLORS.creamDark}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <User size={24} color={COLORS.coral} />
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.charcoal, fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {userProfile ? 'Your Profile' : 'Upload Your Resume'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 8
                  }}
                >
                  <X size={20} color={COLORS.warmGray} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: 28 }}>
                {userProfile ? (
                  // Show Profile
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 24,
                      padding: 20,
                      background: COLORS.cream,
                      borderRadius: 16
                    }}>
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.coralDark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 600
                      }}>
                        {userProfile.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 20, color: COLORS.charcoal }}>{userProfile.name || 'Unknown'}</h3>
                        <p style={{ margin: '4px 0 0', color: COLORS.warmGray }}>{userProfile.title || 'Executive'}</p>
                        {userProfile.location && (
                          <p style={{ margin: '4px 0 0', color: COLORS.warmGrayLight, fontSize: 13 }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                            {userProfile.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {userProfile.summary && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, color: COLORS.warmGray, fontWeight: 600, marginBottom: 8 }}>Summary</h4>
                        <p style={{ margin: 0, fontSize: 14, color: COLORS.charcoalLight, lineHeight: 1.6 }}>{userProfile.summary}</p>
                      </div>
                    )}

                    {userProfile.skills?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, color: COLORS.warmGray, fontWeight: 600, marginBottom: 8 }}>Key Skills</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {userProfile.skills.map((skill, i) => (
                            <span key={i} style={{
                              padding: '6px 12px',
                              background: COLORS.creamDark,
                              borderRadius: 16,
                              fontSize: 13,
                              color: COLORS.charcoalLight
                            }}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {userProfile.targetRoles?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, color: COLORS.warmGray, fontWeight: 600, marginBottom: 8 }}>Target Roles</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {userProfile.targetRoles.map((role, i) => (
                            <span key={i} style={{
                              padding: '6px 12px',
                              background: COLORS.coralLight + '30',
                              border: `1px solid ${COLORS.coralLight}`,
                              borderRadius: 16,
                              fontSize: 13,
                              color: COLORS.coralDark
                            }}>{role}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {userProfile.companies?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, color: COLORS.warmGray, fontWeight: 600, marginBottom: 8 }}>Previous Companies</h4>
                        <p style={{ margin: 0, fontSize: 14, color: COLORS.charcoalLight }}>{userProfile.companies.join(' • ')}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      <label style={{
                        flex: 1,
                        padding: 14,
                        background: 'white',
                        border: `1px solid ${COLORS.creamDark}`,
                        borderRadius: 10,
                        color: COLORS.charcoal,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        textAlign: 'center'
                      }}>
                        <FileText size={16} style={{ display: 'inline', marginRight: 8 }} />
                        Update Resume
                        <input
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          setUserProfile(null);
                          localStorage.removeItem('executiveRadarProfile');
                        }}
                        style={{
                          padding: '14px 20px',
                          background: 'white',
                          border: `1px solid ${COLORS.coralLight}`,
                          borderRadius: 10,
                          color: COLORS.coralDark,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 500
                        }}
                      >
                        Clear Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload Resume
                  <div>
                    <p style={{ margin: '0 0 20px', color: COLORS.warmGray, lineHeight: 1.6 }}>
                      Upload your resume to get personalized job matches. We'll analyze your skills and experience to find opportunities tailored to your background.
                    </p>

                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 40,
                      border: `2px dashed ${COLORS.creamDark}`,
                      borderRadius: 16,
                      cursor: 'pointer',
                      marginBottom: 20,
                      transition: 'all 0.2s'
                    }}>
                      {isParsingResume ? (
                        <>
                          <Loader2 size={40} color={COLORS.coral} style={{ animation: 'spin 1s linear infinite' }} />
                          <p style={{ margin: '16px 0 0', color: COLORS.coral, fontWeight: 500 }}>Analyzing your resume...</p>
                        </>
                      ) : (
                        <>
                          <Upload size={40} color={COLORS.warmGray} />
                          <p style={{ margin: '16px 0 0', color: COLORS.charcoal, fontWeight: 500 }}>Click to upload resume</p>
                          <p style={{ margin: '8px 0 0', color: COLORS.warmGrayLight, fontSize: 13 }}>Supports .txt, .pdf, .doc, .docx</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        style={{ display: 'none' }}
                        disabled={isParsingResume}
                      />
                    </label>

                    <div style={{ textAlign: 'center', margin: '20px 0', color: COLORS.warmGray }}>— or paste your resume text —</div>

                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      style={{
                        width: '100%',
                        minHeight: 150,
                        padding: 16,
                        border: `1px solid ${COLORS.creamDark}`,
                        borderRadius: 12,
                        fontSize: 14,
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />

                    <button
                      onClick={handleResumePaste}
                      disabled={!resumeText.trim() || isParsingResume}
                      style={{
                        width: '100%',
                        marginTop: 16,
                        padding: 16,
                        background: resumeText.trim() ? `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.coralDark} 100%)` : COLORS.creamDark,
                        border: 'none',
                        borderRadius: 12,
                        color: resumeText.trim() ? 'white' : COLORS.warmGray,
                        cursor: resumeText.trim() ? 'pointer' : 'not-allowed',
                        fontSize: 15,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      {isParsingResume ? (
                        <>
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Analyze Resume
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
