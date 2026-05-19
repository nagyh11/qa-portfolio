export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "tools", label: "Tools" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export const STATS = [
  { value: 1, suffix: "+", label: "Years Experience" },
  { value: 500, suffix: "+", label: "Test Cases Executed" },
  { value: 200, suffix: "+", label: "Bugs Reported" },
  { value: 50, suffix: "+", label: "APIs Tested" },
];

export const EXPERIENCES = [
  {
    company: "Advanced Group For Information Technology (AGI)",
    position: "Quality Control Engineer",
    duration: "March 2024 — Present",
    current: true,
    items: [
      "Manual Testing for Gourmet assessment platform",
      "API Testing using Postman",
      "Validating integrations and secure data exchange",
      "Collaborating with developers and business teams",
      "Writing bug reports and executing test cases",
      "Regression testing & exploratory testing",
    ],
  },
  {
    company: "ITWORK EDUCATION",
    position: "Software Testing Intern",
    duration: "Dec 2023 — March 2024",
    current: false,
    items: [
      "Manual Testing for Emirates Schools Establishment systems",
      "API Testing for WinjiGo",
      "UI/UX Testing",
      "Testing using Postman and Rest Assured",
      "Bug reporting and issue tracking",
    ],
  },
];

export const TOOL_CATEGORIES = [
  {
    title: "Testing Skills",
    icon: "ClipboardCheck",
    items: ["Manual Testing", "Exploratory Testing", "Regression Testing", "Smoke Testing", "UI/UX Testing", "Mobile Testing", "Security Testing", "Agile Testing", "UAT"],
  },
  {
    title: "API Testing",
    icon: "Network",
    items: ["Postman", "Rest Assured", "Swagger", "JSON Validation", "XML Validation", "API Testing", "API Automation"],
  },
  {
    title: "Automation Testing",
    icon: "Bot",
    items: ["Selenium WebDriver", "Java", "TestNG", "Maven", "POM Design Pattern", "Data Driven Testing", "Automation Testing"],
  },
  {
    title: "Performance & Security",
    icon: "ShieldCheck",
    items: ["JMeter", "Burp Suite", "Performance Testing", "Security Testing Basics"],
  },
  {
    title: "Project Management & QA Process",
    icon: "Kanban",
    items: ["Jira", "Trello", "Azure DevOps", "SDLC", "STLC", "Bug Reporting", "Test Case Design"],
  },
  {
    title: "Technical Skills",
    icon: "Code2",
    items: ["SQL", "HTML", "CSS", "JavaScript", "Git", "GitHub", "Database Validation"],
  },
];

export const SKILL_GROUPS = [
  {
    title: "Testing Skills",
    skills: [
      { name: "Manual Testing", level: 95 },
      { name: "API Testing", level: 92 },
      { name: "Automation Testing", level: 80 },
      { name: "Exploratory Testing", level: 88 },
      { name: "Agile Testing", level: 85 },
      { name: "UI/UX Testing", level: 82 },
      { name: "Mobile Testing", level: 75 },
      { name: "Security Testing", level: 70 },
    ],
  },
  {
    title: "Automation & Tools",
    skills: [
      { name: "Selenium WebDriver", level: 82 },
      { name: "Postman", level: 95 },
      { name: "Rest Assured", level: 85 },
      { name: "JMeter", level: 70 },
      { name: "Jira", level: 90 },
      { name: "Trello", level: 85 },
      { name: "Azure DevOps", level: 78 },
      { name: "Burp Suite", level: 65 },
    ],
  },
  {
    title: "Programming & Technical",
    skills: [
      { name: "Java", level: 80 },
      { name: "SQL", level: 85 },
      { name: "HTML", level: 88 },
      { name: "CSS", level: 80 },
      { name: "JavaScript", level: 75 },
      { name: "SDLC", level: 90 },
      { name: "Agile Methodology", level: 90 },
    ],
  },
];

export const CERTIFICATIONS = [
  { name: "ISTQB CTFL", issuer: "Certified Tester Foundation Level", icon: "Award" },
  { name: "Postman Automation Project", issuer: "Hands-on API Automation", icon: "Network" },
  { name: "Rest Assured Course", issuer: "API Test Automation", icon: "Server" },
  { name: "Manual Testing Course", issuer: "QA Foundations", icon: "ClipboardCheck" },
  { name: "API Testing Using Rest Assured", issuer: "Coursera", icon: "GraduationCap" },
];
