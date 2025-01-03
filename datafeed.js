const mongoose = require("mongoose");
const Job = require("./models/job"); // Adjust path as needed

const jobsData = [
    {
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      description: "Design and implement user-facing features using React.js and maintain web applications' performance.",
      skills: ["React.js", "JavaScript", "HTML", "CSS"],
      exp: "2-3 years",
      salary: "$80,000 - $100,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Backend Developer",
      company: "Innovate Solutions",
      location: "New York, NY",
      description: "Develop scalable backend systems and APIs to support client applications.",
      skills: ["Node.js", "Express", "MongoDB", "AWS"],
      exp: "3-5 years",
      salary: "$90,000 - $120,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Data Scientist",
      company: "DataHub",
      location: "Austin, TX",
      description: "Analyze complex datasets to provide actionable insights and build predictive machine learning models.",
      skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
      exp: "4-6 years",
      salary: "$110,000 - $140,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "UI/UX Designer",
      company: "Creative Minds",
      location: "Seattle, WA",
      description: "Design user interfaces and enhance user experiences for mobile and web platforms.",
      skills: ["Figma", "Adobe XD", "Wireframing", "Prototyping"],
      exp: "1-2 years",
      salary: "$60,000 - $80,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Full Stack Developer",
      company: "CloudWorks",
      location: "Los Angeles, CA",
      description: "Build full-stack web applications using modern technologies and frameworks.",
      skills: ["React.js", "Node.js", "GraphQL", "PostgreSQL"],
      exp: "3-4 years",
      salary: "$95,000 - $130,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "DevOps Engineer",
      company: "Opsify",
      location: "Denver, CO",
      description: "Streamline CI/CD pipelines and maintain cloud-based infrastructure.",
      skills: ["AWS", "Docker", "Kubernetes", "Jenkins"],
      exp: "3-5 years",
      salary: "$100,000 - $130,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Mobile App Developer",
      company: "AppGenix",
      location: "Miami, FL",
      description: "Develop cross-platform mobile applications using Flutter or React Native.",
      skills: ["Flutter", "React Native", "Dart", "JavaScript"],
      exp: "2-4 years",
      salary: "$85,000 - $110,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Product Manager",
      company: "VisionTech",
      location: "Boston, MA",
      description: "Lead product development teams and manage the product lifecycle from ideation to launch.",
      skills: ["Product Management", "Agile", "JIRA", "Market Research"],
      exp: "5+ years",
      salary: "$120,000 - $150,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Cybersecurity Analyst",
      company: "SecureBase",
      location: "Chicago, IL",
      description: "Monitor and secure systems against cyber threats, ensuring data integrity and privacy.",
      skills: ["Cybersecurity", "Firewall Management", "SIEM", "Penetration Testing"],
      exp: "2-5 years",
      salary: "$95,000 - $125,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "AI/ML Engineer",
      company: "NextGenAI",
      location: "San Jose, CA",
      description: "Develop and optimize machine learning models for real-world applications.",
      skills: ["Python", "TensorFlow", "PyTorch", "NLP"],
      exp: "3-6 years",
      salary: "$130,000 - $160,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Cloud Architect",
      company: "CloudNative",
      location: "Dallas, TX",
      description: "Design and implement scalable and secure cloud architectures.",
      skills: ["AWS", "Azure", "Cloud Security", "Terraform"],
      exp: "6+ years",
      salary: "$140,000 - $180,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Quality Assurance Engineer",
      company: "TestWorks",
      location: "Philadelphia, PA",
      description: "Develop and execute test plans to ensure software quality and reliability.",
      skills: ["Automation Testing", "Selenium", "JIRA", "API Testing"],
      exp: "2-4 years",
      salary: "$70,000 - $90,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Technical Writer",
      company: "DocuMentor",
      location: "Portland, OR",
      description: "Create and manage technical documentation for software products.",
      skills: ["Technical Writing", "Markdown", "API Documentation", "XML"],
      exp: "1-3 years",
      salary: "$65,000 - $85,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Blockchain Developer",
      company: "CryptoLogic",
      location: "Remote",
      description: "Develop and maintain blockchain-based applications and smart contracts.",
      skills: ["Blockchain", "Ethereum", "Solidity", "Web3.js"],
      exp: "2-5 years",
      salary: "$100,000 - $140,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    },
    {
      title: "Digital Marketing Specialist",
      company: "Marketly",
      location: "Atlanta, GA",
      description: "Plan and execute digital marketing campaigns to improve brand presence.",
      skills: ["SEO", "Google Analytics", "Content Marketing", "PPC"],
      exp: "1-3 years",
      salary: "$55,000 - $75,000",
      postedBy: "67692ad3b09ab8fd690592a4"
    }
  ];
  

mongoose
  .connect("mongodb://localhost:27017/job-search-platform", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    return Job.insertMany(jobsData);
  })
  .then(() => {
    console.log("Jobs data inserted successfully");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error inserting jobs data:", err);
    mongoose.connection.close();
  });
