/**
 * Deterministic, offline resume parser used to generate editable profile
 * suggestions. It never persists data by itself.
 */

const KNOWN_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Ruby', 'PHP', 'Swift',
    'Kotlin', 'Rust', 'Scala', 'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'Tailwind', 'Bootstrap',
    'React', 'React Native', 'Redux', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'jQuery',
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Laravel',
    'Rails', 'ASP.NET', 'GraphQL', 'REST', 'REST API', 'gRPC', 'WebSockets', 'Socket.io',
    'MongoDB', 'PostgreSQL', 'Postgres', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'Cassandra',
    'Firebase', 'Supabase', 'Prisma', 'Mongoose', 'Sequelize', 'Docker', 'Kubernetes', 'K8s',
    'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'Git', 'GitHub', 'GitLab',
    'Linux', 'Nginx', 'Kafka', 'RabbitMQ', 'Jest', 'Mocha', 'Cypress', 'Playwright', 'Selenium',
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Machine Learning', 'Deep Learning',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'scikit-learn', 'Power BI', 'Tableau', 'Excel',
    'SEO', 'Google Analytics', 'Content Marketing', 'Digital Marketing', 'Salesforce', 'CRM',
    'Recruiting', 'Talent Acquisition', 'Project Management', 'Agile', 'Scrum', 'Jira',
    'Customer Service', 'Financial Analysis', 'Accounting', 'Microservices', 'Accessibility'
];

const ROLE_KEYWORDS = [
    'Engineer', 'Developer', 'Designer', 'Manager', 'Analyst', 'Architect', 'Consultant',
    'Scientist', 'Administrator', 'Specialist', 'Lead', 'Director', 'Programmer', 'Recruiter',
    'Accountant', 'Marketer', 'Coordinator', 'Executive'
];

const SECTION_ALIASES = {
    summary: ['professional summary', 'summary', 'profile', 'about me', 'objective', 'about'],
    experience: ['professional experience', 'work experience', 'experience', 'employment history', 'work history'],
    education: ['education', 'academic background', 'qualifications'],
    skills: ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise']
};

const DEGREE_RE = /\b(bachelor|master|doctorate|phd|b\.?sc|m\.?sc|b\.?a|m\.?a|mba|diploma|degree|university|college)\b/i;
const DATE_RANGE_RE = /\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current|now)\b/i;
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_RE = /(?:https?:\/\/|www\.)[^\s<>()]+/gi;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cleanLine = (line) => line.replace(/^[\s•·▪◦*-]+/, '').replace(/\s{2,}/g, ' ').trim();
const linesOf = (text) => text.split(/\r?\n/).map(cleanLine).filter(Boolean);

function normalizeHeading(line) {
    return line.toLowerCase().replace(/[:|•·▪◦\-–—]/g, ' ').replace(/\s+/g, ' ').trim();
}

function headingType(line) {
    const normalized = normalizeHeading(line);
    for (const [type, aliases] of Object.entries(SECTION_ALIASES)) {
        if (aliases.includes(normalized)) return type;
    }
    return null;
}

function splitSections(text) {
    const sections = { header: [] };
    let current = 'header';
    for (const line of linesOf(text)) {
        const type = headingType(line);
        if (type) {
            current = type;
            sections[current] ||= [];
        } else {
            sections[current] ||= [];
            sections[current].push(line);
        }
    }
    return sections;
}

function extractSkills(text) {
    const found = [];
    const seen = new Set();
    for (const skill of [...KNOWN_SKILLS].sort((a, b) => b.length - a.length)) {
        const pattern = new RegExp(`(^|[^A-Za-z0-9+#.])${escapeRegex(skill)}([^A-Za-z0-9+#]|$)`, 'i');
        const canonical = skill.toLowerCase() === 'postgres' ? 'PostgreSQL'
            : skill.toLowerCase() === 'k8s' ? 'Kubernetes'
                : skill.toLowerCase() === 'golang' ? 'Go'
                    : skill;
        if (pattern.test(text) && !seen.has(canonical.toLowerCase())) {
            seen.add(canonical.toLowerCase());
            found.push(canonical);
        }
    }
    return found;
}

function extractContact(text, sections = splitSections(text)) {
    const email = text.match(EMAIL_RE)?.[0] || '';
    const phone = text.match(PHONE_RE)?.[0]?.replace(/\s+/g, ' ').trim() || '';
    const header = sections.header || [];
    const location = header.find((line) =>
        !EMAIL_RE.test(line)
        && !PHONE_RE.test(line)
        && !/(?:https?:\/\/|www\.)/i.test(line)
        && line.length >= 3
        && line.length <= 80
        && /,|cairo|egypt|remote|city|state|country/i.test(line)
    ) || '';
    return { email, phone, location };
}

function extractLinks(text) {
    const urls = (text.match(URL_RE) || []).map((url) =>
        url.startsWith('www.') ? `https://${url}` : url
    );
    const linkedin = urls.find((url) => /linkedin\.com/i.test(url)) || '';
    const github = urls.find((url) => /github\.com/i.test(url)) || '';
    const other = urls.filter((url) => url !== linkedin && url !== github);
    return {
        linkedin,
        github,
        portfolio: other[0] || '',
        website: other[1] || ''
    };
}

function extractTitle(text) {
    for (const line of linesOf(text).slice(0, 15)) {
        if (line.length > 80 || EMAIL_RE.test(line) || PHONE_RE.test(line) || URL_RE.test(line)) continue;
        if (ROLE_KEYWORDS.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(line))) {
            return line;
        }
    }
    return '';
}

function extractBio(text, sections = splitSections(text)) {
    const summaryLines = sections.summary || [];
    return summaryLines.length ? summaryLines.join(' ').slice(0, 800) : '';
}

function yearToDate(year, end = false) {
    if (!year || /present|current|now/i.test(year)) return null;
    return `${year}-${end ? '12-31' : '01-01'}`;
}

function extractExperience(text, sections = splitSections(text)) {
    const lines = sections.experience || [];
    const results = [];
    for (let index = 0; index < lines.length; index += 1) {
        const match = lines[index].match(DATE_RANGE_RE);
        if (!match) continue;
        const previous = lines.slice(Math.max(0, index - 2), index);
        const following = [];
        for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
            if (DATE_RANGE_RE.test(lines[cursor])) break;
            if (DATE_RANGE_RE.test(lines[cursor + 2] || '')) break;
            following.push(lines[cursor]);
            if (following.join(' ').length > 500) break;
        }
        results.push({
            position: previous[0] || '',
            company: previous[1] || '',
            startDate: yearToDate(match[1]),
            endDate: yearToDate(match[2], true),
            description: following.join(' ').slice(0, 1000)
        });
    }
    return results.slice(0, 15);
}

function extractEducation(text, sections = splitSections(text)) {
    const lines = sections.education || [];
    const results = [];
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        if (!DEGREE_RE.test(line)) continue;
        const yearMatch = lines.slice(index, index + 3).join(' ').match(/\b((?:19|20)\d{2})\b/);
        const parts = line.split(/[,|–—-]/).map(cleanLine).filter(Boolean);
        results.push({
            institution: parts.find((part) => /university|college|institute|school/i.test(part))
                || lines[index + 1]
                || '',
            degree: parts.find((part) => DEGREE_RE.test(part)) || line,
            fieldOfStudy: parts.length > 1 ? parts[1] : '',
            graduationYear: yearMatch ? Number(yearMatch[1]) : null
        });
        // The next line is commonly the institution belonging to this degree;
        // do not treat it as a second education record.
        if (lines[index + 1] && /university|college|institute|school/i.test(lines[index + 1])) {
            index += 1;
        }
    }
    return results.slice(0, 10);
}

function parseResumeText(text) {
    const clean = (text || '').replace(/\0/g, '').trim();
    const sections = splitSections(clean);
    return {
        title: extractTitle(clean),
        bio: extractBio(clean, sections),
        contact: extractContact(clean, sections),
        skills: extractSkills(clean),
        experience: extractExperience(clean, sections),
        education: extractEducation(clean, sections),
        socialLinks: extractLinks(clean),
        warnings: sections.experience?.length ? [] : ['No recognizable experience section was found.']
    };
}

module.exports = {
    parseResumeText,
    extractSkills,
    extractTitle,
    extractBio,
    extractContact,
    extractLinks,
    extractExperience,
    extractEducation,
    splitSections,
    KNOWN_SKILLS
};
