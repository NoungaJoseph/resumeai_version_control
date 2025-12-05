import { ResumeData } from '../types';

export const SAMPLE_RESUME_DATA: ResumeData = {
    language: 'en',
    mode: 'resume',
    template: 'modern',
    themeColor: '#3b82f6',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+237 670 000 000',
    location: 'Douala, Cameroon',
    linkedin: 'linkedin.com/in/alexmorgan',
    website: 'alexmorgan.dev',
    targetRole: 'Senior Software Engineer',
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
