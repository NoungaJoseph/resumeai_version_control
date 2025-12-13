import { ResumeData } from '../types';

export const SAMPLE_RESUME_DATA: ResumeData = {
    language: 'en',
    mode: 'resume',
    template: 'modern',
    themeColor: '#3b82f6',
    fullName: 'Nounga Joseph Youmi',
    email: 'noungajoseph58@gmail.com',
    phone: '+237 671063170',
    location: 'Douala, Cameroon',
    linkedin: 'linkedin.com/in/noungajoseph58',
    website: 'noungajosephyoumi.dev',
    targetRole: 'Software Engineer',
    summary: 'Experienced Software Engineer with over 5 years of experience in building scalable web applications. Proficient in React, Node.js, and Cloud Architecture. Passionate about clean code and user-centric design.',
    experience: [
        {
            id: '1',
            company: 'Tech Solutions Inc.',
            role: 'Senior Frontend Developer',
            dates: '2021 - Present',
            description: 'Led the migration of a legacy monolith to a micro-frontend architecture using React and Webpack. Improved page load time by 40%.'
        },
        {
            id: '2',
            company: 'Creative Agency',
            role: 'Web Developer',
            dates: '2018 - 2021',
            description: 'Developed responsive websites for various clients using HTML5, CSS3, and JavaScript. Collaborated with designers to implement pixel-perfect UIs.'
        }
    ],
    education: [
        {
            id: '1',
            school: 'University of Buea',
            degree: 'B.Sc. in Computer Science',
            dates: '2014 - 2018'
        }
    ],
    skills: 'React, TypeScript, Node.js, Tailwind CSS, Docker, AWS, Git, Agile Methodologies',
    projects: [
        {
            id: '1',
            name: 'E-commerce Platform',
            description: 'Built a full-stack e-commerce platform with real-time inventory management and payment integration.',
            link: 'github.com/alexmorgan/ecommerce',
            dates: '2022'
        }
    ],
    certifications: 'AWS Certified Solutions Architect, Meta Frontend Developer Certificate',
    languages: 'English (Native), French (Professional)',
    achievements: 'Best Developer Award 2022, Hackathon Winner 2020',
    publications: '',
    internships: [],
    volunteering: [],
    isPaid: false,
    hasDownloaded: false
};

export const SAMPLE_MOTIVATION_DATA: ResumeData = {
    ...SAMPLE_RESUME_DATA,
    mode: 'motivation-letter',
    organizationName: 'Global Tech Initiative',
    positionApplied: 'Senior Solution Architect',
    motivationText: "I am writing to express my strong interest in the Senior Solution Architect position at Global Tech Initiative. With a proven track record in designing scalable cloud architectures and leading engineering teams, I believe I can significantly contribute to your mission of digital transformation. Your company's commitment to open-source innovation deeply resonates with my professional values.",
    summary: 'Cloud Architect with 8+ years of experience. Expert in AWS and Azure. Proven leadership skills.',
    skills: 'Cloud Architecture, Team Leadership, Digital Transformation, Microservices',
};

export const SAMPLE_INTERNSHIP_DATA: ResumeData = {
    ...SAMPLE_RESUME_DATA,
    mode: 'internship-letter',
    schoolName: 'University of Buea',
    program: 'Computer Engineering',
    educationLevel: 'Masters Degree',
    internshipStartDate: '2024-06-01',
    internshipEndDate: '2024-12-01',
    companyName: 'Silicon Mountain Tech',
    supervisorName: 'Dr. Sarah Connor',
    motivationText: "I am a final year Computer Engineering student passionate about embedded systems. I have followed Silicon Mountain Tech's recent work in IoT with great admiration and would be honored to learn from your engineering team.",
    skills: 'C++, Embedded Systems, Circuit Design, Python',
    expectedOutcomes: 'Practical experience in IoT deployment, Mentorship from senior engineers, Contribution to ongoing projects.',
};

export const SAMPLE_VISA_DATA: ResumeData = {
    ...SAMPLE_RESUME_DATA,
    mode: 'visa-letter',
    dob: '1995-05-15',
    passportNumber: 'CM123456789',
    nationality: 'Cameroonian',
    passportIssueDate: '2020-01-01',
    passportExpiryDate: '2030-01-01',
    destinationCountry: 'France',
    embassyDetails: 'Embassy of France, Yaoundé, Cameroon',
    travelStartDate: '2024-09-01',
    travelEndDate: '2024-09-15',
    travelPurpose: 'To attend the TechCon Paris 2024 conference and hold business meetings with potential partners.',
    sponsorshipType: 'self',
    accommodationDetails: 'Hotel Novotel Paris Centre Tour Eiffel, 61 Quai de Grenelle, 75015 Paris',
    returnAssurance: 'I have a permanent employment contract with Tech Solutions Inc. in Cameroon and own property in Douala. My family resides in Cameroon.',
    supportingDocuments: '1. Invitation Letter from Conference Organizers\n2. Hotel Reservation\n3. Flight Itinerary\n4. Bank Statements (Last 6 months)\n5. Employment Verification Letter',
};

export const SAMPLE_BUSINESS_PLAN_DATA: ResumeData = {
    ...SAMPLE_RESUME_DATA,
    mode: 'business-plan',
    businessName: 'AgroTech Cameroon',
    ownerName: 'Nounga Joseph Youmi',
    location: 'Douala, Cameroon',
    businessSector: 'Agriculture & Technology',
    problemStatement: 'Small-scale farmers in Cameroon lack access to real-time market data and reliable supply chains, leading to 40% post-harvest loss.',
    solutionOverview: 'A mobile-first platform connecting farmers directly to buyers, providing weather forecasts, and facilitating logistics aggregation.',
    targetCustomers: 'Smallholder farmers (primary), Urban restaurants and supermarkets (secondary), Food processing companies.',
    competitors: 'Traditional middlemen, Local cooperative unions, Simple WhatsApp groups.',
    uniqueAdvantage: 'AI-driven price prediction and integrated cold-chain logistics network.',
    startupCosts: '5,000,000 XAF',
    operatingCosts: '500,000 XAF/month',
    expectedRevenue: '2,000,000 XAF/month (Year 1)',
    revenueModel: 'Commission on sales (5%), Premium subscription for market insights.',
    marketingStrategy: 'Partnerships with rural radio stations, Community workshops, Social media targeting urban buyers.',
    longTermVision: 'To become the leading digital agricultural ecosystem in Central Africa, reducing food waste by 50% by 2030.',
};

export const SAMPLE_LEGAL_DATA: ResumeData = {
    ...SAMPLE_RESUME_DATA,
    mode: 'legal-agreement',
    template: 'legal-lease',
    legalPartyA: 'Nji Monies (Landlord)',
    legalPartyB: 'Nounga Joseph (Tenant)',
    agreementDate: '2024-01-01',
    financialValue: '150,000 XAF / month',
    agreementTerms: '1. The lease shall be for a period of 12 months.\n2. Security deposit of 3 months rent is required.\n3. Water and Electricity bills are to be paid by the Tenant.\n4. No major structural modifications allowed without written consent.',
};
