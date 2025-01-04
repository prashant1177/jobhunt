const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/user");
const Job = require('./models/job');
const Application = require("./models/application");

mongoose.connect("mongodb://localhost:27017/job-search-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = await User.insertMany([
      { name: "Alice", email: "alice@example.com", password: hashedPassword, role: "jobSeeker", profile: { skills: ["JavaScript", "React"], bio: "Frontend Developer", location: "NYC" } },
      { name: "Bob", email: "bob@example.com", password: hashedPassword, role: "jobSeeker", profile: { skills: ["Node.js", "Express"], bio: "Backend Developer", location: "SF" } },
      { name: "Charlie", email: "charlie@example.com", password: hashedPassword, role: "employer", profile: { company: "TechCorp", location: "NYC", bio: "We build amazing software." } },
      { name: "Diana", email: "diana@example.com", password: hashedPassword, role: "employer", profile: { company: "Innovatech", location: "SF", bio: "Innovating the future." } },
      { name: "Eve", email: "eve@example.com", password: hashedPassword, role: "jobSeeker", profile: { skills: ["Python", "Django"], bio: "Full Stack Developer", location: "LA" } },
      { name: "Frank", email: "frank@example.com", password: hashedPassword, role: "employer", profile: { company: "Cloudify", location: "Seattle", bio: "Pioneering cloud solutions." } },
      { name: "Grace", email: "grace@example.com", password: hashedPassword, role: "jobSeeker", profile: { skills: ["AWS", "DevOps"], bio: "Cloud Engineer", location: "Chicago" } },
      { name: "Hank", email: "hank@example.com", password: hashedPassword, role: "jobSeeker", profile: { skills: ["Java", "Spring Boot"], bio: "Backend Specialist", location: "Boston" } },
      { name: "Ivy", email: "ivy@example.com", password: hashedPassword, role: "employer", profile: { company: "NextGen", location: "Austin", bio: "Shaping tomorrow's tech." } },
      { name: "Jack", email: "jack@example.com", password: hashedPassword, role: "jobSeeker", profile: { skills: ["C++", "Game Development"], bio: "Game Developer", location: "Denver" } },
    ]);

    // Create jobs
    const jobs = await Job.insertMany([
      { title: "Frontend Developer", company: "TechCorp", location: "NYC", description: "Build amazing UIs.", skills: ["JavaScript", "React", "CSS"], exp: "2+ years", salary: "$80,000-$100,000", postedBy: users[2]._id },
      { title: "Backend Developer", company: "TechCorp", location: "NYC", description: "Develop robust APIs.", skills: ["Node.js", "Express", "MongoDB"], exp: "3+ years", salary: "$90,000-$110,000", postedBy: users[2]._id },
      { title: "Full Stack Developer", company: "Innovatech", location: "SF", description: "Work on both frontend and backend.", skills: ["JavaScript", "Node.js", "React"], exp: "4+ years", salary: "$100,000-$120,000", postedBy: users[3]._id },
      { title: "DevOps Engineer", company: "Innovatech", location: "SF", description: "Manage cloud infrastructure.", skills: ["AWS", "Docker", "Kubernetes"], exp: "3+ years", salary: "$95,000-$115,000", postedBy: users[3]._id },
      { title: "Data Scientist", company: "Cloudify", location: "Seattle", description: "Analyze complex datasets.", skills: ["Python", "Machine Learning", "Pandas"], exp: "3+ years", salary: "$120,000-$140,000", postedBy: users[5]._id },
      { title: "Cloud Engineer", company: "Cloudify", location: "Seattle", description: "Build scalable cloud solutions.", skills: ["AWS", "Terraform", "Docker"], exp: "2+ years", salary: "$90,000-$110,000", postedBy: users[5]._id },
      { title: "Software Engineer", company: "NextGen", location: "Austin", description: "Develop innovative software.", skills: ["Java", "Spring", "Microservices"], exp: "5+ years", salary: "$110,000-$130,000", postedBy: users[8]._id },
      { title: "Game Developer", company: "NextGen", location: "Austin", description: "Create engaging games.", skills: ["C++", "Unity", "3D Modeling"], exp: "3+ years", salary: "$100,000-$120,000", postedBy: users[8]._id },
      { title: "QA Engineer", company: "TechCorp", location: "NYC", description: "Ensure software quality.", skills: ["Selenium", "JIRA", "Postman"], exp: "2+ years", salary: "$75,000-$90,000", postedBy: users[2]._id },
      { title: "Network Engineer", company: "Innovatech", location: "SF", description: "Manage network infrastructure.", skills: ["Cisco", "Networking", "Linux"], exp: "4+ years", salary: "$95,000-$115,000", postedBy: users[3]._id },
    ]);

    // Create applications
    const applications = await Application.insertMany([
      { job: jobs[0]._id, applicant: users[0]._id, resume: "alice_resume.pdf", additionalDetails: "Excited to contribute to the team!" },
      { job: jobs[1]._id, applicant: users[1]._id, resume: "bob_resume.pdf", additionalDetails: "Experienced backend developer." },
      { job: jobs[2]._id, applicant: users[0]._id, resume: "alice_resume.pdf", additionalDetails: "Versatile developer with frontend skills." },
      { job: jobs[3]._id, applicant: users[1]._id, resume: "bob_resume.pdf", additionalDetails: "Interested in cloud technologies." },
      { job: jobs[4]._id, applicant: users[4]._id, resume: "eve_resume.pdf", additionalDetails: "Passionate about data science." },
      { job: jobs[5]._id, applicant: users[6]._id, resume: "grace_resume.pdf", additionalDetails: "Skilled in AWS and DevOps." },
      { job: jobs[6]._id, applicant: users[7]._id, resume: "hank_resume.pdf", additionalDetails: "Expert in Java and microservices." },
      { job: jobs[7]._id, applicant: users[9]._id, resume: "jack_resume.pdf", additionalDetails: "Experienced game developer." },
      { job: jobs[8]._id, applicant: users[0]._id, resume: "alice_resume.pdf", additionalDetails: "Great attention to detail." },
      { job: jobs[9]._id, applicant: users[6]._id, resume: "grace_resume.pdf", additionalDetails: "Networking enthusiast." },
    ]);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    mongoose.connection.close();
  }
};

seedDatabase();
