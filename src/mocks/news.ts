import { NewsArticle, NewsCategory } from '../types/news';

export const newsCategories: NewsCategory[] = [
  'Política',
  'Economia',
  'Tecnologia',
  'Ciencia',
  'Esportes',
  'Geral',
];

export const newsArticlesByCategory: Record<NewsCategory, NewsArticle[]> = {
  Política: [
    {
      id: 'politica-civic-debate',
      category: 'Política',
      headline: 'Civic Debate Expands as Local Leaders Discuss Public Priorities',
      summary: 'Community leaders opened a new round of public conversations about education, transport, and trust.',
      source: 'DumaNews Politics Desk',
      publishedAt: '21 May 2026',
      content:
        'Local leaders met in a public forum to discuss transportation, school investment, and community trust. Speakers defended a more transparent decision process and encouraged residents to participate in the next budget hearings. Analysts said the tone of the debate was calmer than in previous months, which may help long term dialogue between groups with different priorities.',
    },
    {
      id: 'politica-regional-agreements',
      category: 'Política',
      headline: 'Regional Agreements Advance After Week of Institutional Negotiation',
      summary: 'Officials reported progress after a series of negotiations focused on shared public commitments.',
      source: 'DumaNews Politics Desk',
      publishedAt: '21 May 2026',
      content:
        'Regional officials reported progress after a week of institutional negotiation involving transport, digital access, and public services. Observers said the agreements remain preliminary, but the process showed greater willingness to coordinate priorities across different levels of government. Negotiators are expected to return next month with a more detailed action plan.',
    },
    {
      id: 'politica-civic-participation',
      category: 'Política',
      headline: 'Public Participation Rises as Residents Follow New City Hearings',
      summary: 'The latest hearings attracted more residents interested in budget transparency and urban planning.',
      source: 'DumaNews Politics Desk',
      publishedAt: '21 May 2026',
      content:
        'Attendance at recent city hearings increased as more residents became interested in budget transparency and urban planning. Community groups said accessible language and clearer timelines encouraged people to join the discussion. Analysts believe that stable participation may improve accountability if the process remains open and consistent.',
    },
  ],
  Economia: [
    {
      id: 'economia-small-businesses',
      category: 'Economia',
      headline: 'Small Businesses Report Steady Growth After Strong Consumer Demand',
      summary: 'Independent shops and service providers reported better sales and more confidence for the next quarter.',
      source: 'DumaNews Economy Desk',
      publishedAt: '21 May 2026',
      content:
        'Small businesses in urban centers reported steady growth after a period of stronger consumer demand. Retailers said customers are spending more carefully, but they are still returning for essential products and local services. Economists noted that stable employment and lower uncertainty have supported confidence, especially among family owned businesses.',
    },
    {
      id: 'economia-household-planning',
      category: 'Economia',
      headline: 'Households Adjust Spending Plans While Savings Goals Become More Visible',
      summary: 'Families are revisiting monthly budgets and prioritizing expenses with greater discipline.',
      source: 'DumaNews Economy Desk',
      publishedAt: '21 May 2026',
      content:
        'Families are revisiting monthly budgets and planning expenses with greater discipline as prices stabilize in some sectors and remain uncertain in others. Financial educators say more households are setting short term savings goals and tracking fixed costs more carefully. The shift may reduce impulse spending and support better long term planning.',
    },
    {
      id: 'economia-logistics-outlook',
      category: 'Economia',
      headline: 'Logistics Sector Sees Better Outlook as Delivery Networks Recover Speed',
      summary: 'Operators say coordination and infrastructure upgrades are improving delivery reliability.',
      source: 'DumaNews Economy Desk',
      publishedAt: '21 May 2026',
      content:
        'Logistics operators said delivery networks are regaining speed after investments in route planning and local infrastructure. Businesses described the improvement as gradual but meaningful for stock control and customer expectations. Analysts added that reliable delivery performance often creates secondary gains across retail and regional services.',
    },
  ],
  Tecnologia: [
    {
      id: 'tecnologia-ai-tools',
      category: 'Tecnologia',
      headline: 'AI Study Tools Gain Attention as Students Seek Faster Daily Practice',
      summary: 'New learning platforms are combining audio, reading, and revision into short study sessions.',
      source: 'DumaNews Tech',
      publishedAt: '21 May 2026',
      content:
        'Education technology platforms are gaining attention by combining audio lessons, reading practice, and spaced repetition into a single daily routine. Developers say the goal is to reduce friction and help students practice more often. Teachers remain interested, but they continue to ask for clear evidence that these tools improve retention over time.',
    },
    {
      id: 'tecnologia-mobile-security',
      category: 'Tecnologia',
      headline: 'Mobile Security Updates Push Users to Review App Permissions More Often',
      summary: 'Experts say routine permission checks are becoming a key part of digital hygiene.',
      source: 'DumaNews Tech',
      publishedAt: '21 May 2026',
      content:
        'Security researchers say recent mobile platform updates are encouraging users to review app permissions more often. The recommendation is simple: remove access that no longer matches the purpose of an installed app. Specialists argue that small habits like permission reviews and regular updates can prevent larger privacy problems later.',
    },
    {
      id: 'tecnologia-cloud-workflows',
      category: 'Tecnologia',
      headline: 'Cloud Workflows Become Simpler as Teams Consolidate Tools',
      summary: 'Product teams are reducing friction by centralizing media, documents, and collaboration flows.',
      source: 'DumaNews Tech',
      publishedAt: '21 May 2026',
      content:
        'Product teams are simplifying cloud workflows by centralizing assets, documents, and collaboration routines in fewer systems. Managers say the immediate benefit is lower operational friction, while engineers highlight gains in consistency and onboarding speed. The broader challenge remains keeping flexibility without recreating complexity in another form.',
    },
  ],
  Ciencia: [
    {
      id: 'ciencia-ocean-research',
      category: 'Ciencia',
      headline: 'Ocean Research Team Maps New Patterns in Coastal Water Quality',
      summary: 'Scientists identified seasonal changes that may improve early warning systems for local communities.',
      source: 'DumaNews Science',
      publishedAt: '21 May 2026',
      content:
        'A research team studying coastal ecosystems mapped new patterns in water quality during seasonal transitions. The group said the findings may improve local warning systems and help communities react earlier to environmental change. Researchers emphasized that long term observation remains essential because short data windows often hide important trends.',
    },
    {
      id: 'ciencia-climate-labs',
      category: 'Ciencia',
      headline: 'Climate Labs Expand Open Data Projects to Support Local Forecasting',
      summary: 'Scientists hope wider access to data will improve public understanding and local planning.',
      source: 'DumaNews Science',
      publishedAt: '21 May 2026',
      content:
        'Climate research groups are expanding open data projects to support local forecasting and improve public understanding of environmental change. Scientists said more accessible datasets can help schools, community groups, and planners work with the same evidence base. They also warned that data without context can still be misunderstood, making communication essential.',
    },
    {
      id: 'ciencia-health-patterns',
      category: 'Ciencia',
      headline: 'Health Researchers Study Daily Patterns That Influence Long Term Wellbeing',
      summary: 'Teams are focusing on sleep, movement, and social routines rather than isolated habits.',
      source: 'DumaNews Science',
      publishedAt: '21 May 2026',
      content:
        'Health researchers are increasingly studying daily patterns instead of isolated behaviors when they evaluate long term wellbeing. Teams say sleep, movement, nutrition, and social connection often reinforce one another. This broader view may produce better guidance because people rarely change one habit without changing their routine as a whole.',
    },
  ],
  Esportes: [
    {
      id: 'esportes-training-routine',
      category: 'Esportes',
      headline: 'Coaches Highlight Recovery and Discipline After Demanding Training Week',
      summary: 'Teams are focusing on recovery habits, communication, and consistent execution before the next match.',
      source: 'DumaNews Sports',
      publishedAt: '21 May 2026',
      content:
        'After a demanding training week, coaches highlighted the importance of recovery, discipline, and communication. Staff members said performance often depends on simple habits repeated every day, not only on intensity. Athletes also noted that better preparation outside competition helps them stay calm when matches become more difficult.',
    },
    {
      id: 'esportes-team-balance',
      category: 'Esportes',
      headline: 'Team Balance Improves as Players Adapt to New Tactical Responsibilities',
      summary: 'Coaches say clearer roles are helping the squad react faster during transitions.',
      source: 'DumaNews Sports',
      publishedAt: '21 May 2026',
      content:
        'Coaches reported better team balance after players adapted to new tactical responsibilities during recent training sessions. Analysts observed that quicker transitions and clearer communication reduced avoidable mistakes. Staff members said stable habits under pressure are often more valuable than dramatic individual moments.',
    },
    {
      id: 'esportes-youth-development',
      category: 'Esportes',
      headline: 'Youth Development Programs Prioritize Patience Over Immediate Results',
      summary: 'Technical staff want long term growth, strong fundamentals, and better decision making.',
      source: 'DumaNews Sports',
      publishedAt: '21 May 2026',
      content:
        'Youth development programs are increasingly prioritizing patience, strong fundamentals, and decision making over immediate results. Coaches argue that a long term view helps athletes grow with less pressure and more confidence. They also say the best development systems protect consistency rather than chasing quick visibility.',
    },
  ],
  Geral: [
    {
      id: 'geral-city-library',
      category: 'Geral',
      headline: 'City Library Launches Reading Program Focused on Lifelong Learning',
      summary: 'The new program encourages families and adult learners to build a consistent reading habit together.',
      source: 'DumaNews General',
      publishedAt: '21 May 2026',
      content:
        'The city library launched a new reading program designed for families, adult learners, and young readers. Organizers said the goal is to create consistent reading habits by mixing public events, short recommendations, and accessible discussion groups. Librarians believe the program can strengthen both language skills and community participation over the coming months.',
    },
    {
      id: 'geral-public-spaces',
      category: 'Geral',
      headline: 'Public Spaces Receive New Activity Program to Encourage Community Use',
      summary: 'Organizers want parks and plazas to host more accessible cultural and educational events.',
      source: 'DumaNews General',
      publishedAt: '21 May 2026',
      content:
        'Public spaces will receive a new activity program designed to encourage broader community use of parks and plazas. Organizers said the initiative combines cultural programming, practical workshops, and open access events. The expectation is that more frequent use will strengthen safety, belonging, and neighborhood interaction.',
    },
    {
      id: 'geral-local-education',
      category: 'Geral',
      headline: 'Local Education Networks Coordinate New Reading and Listening Challenges',
      summary: 'Schools and cultural centers are combining reading and audio activities for daily practice.',
      source: 'DumaNews General',
      publishedAt: '21 May 2026',
      content:
        'Schools and cultural centers are coordinating a new series of reading and listening challenges for students and families. Organizers said the activities are short by design, making them easier to repeat every day. They hope the program will improve consistency and make learning feel more natural outside the classroom.',
    },
  ],
};

export const featuredNewsArticle = newsArticlesByCategory.Geral[0];
