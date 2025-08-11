require("dotenv").config(); // Add this line at the top
var express = require("express"),
  engine = require("ejs-mate"),
  app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport"); // Adjust path as needed
const MongoDBStore = require("connect-mongodb-session")(session);

const flash = require("connect-flash");
// const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

passport.serializeUser((user, done) => {
  done(null, user.id); // Save user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = (await Student.findById(id)) || (await Recruiter.findById(id)); // Find user by ID
    done(null, user); // Attach user to req.user
  } catch (err) {
    done(err);
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretcode",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(flash());
const Student = require("./models/student");
const Recruiter = require("./models/recruiter");
const Job = require("./models/job");
const Application = require("./models/application");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// Middleware
app.use((req, res, next) => {
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  next();
});

app.get("/", async function (req, res) {
  try {
    // Fetch all unique skills from jobs

    const userDetails = req.user
      ? (await Student.findById(req.user._id)) ||
        (await Recruiter.findById(req.user._id))
      : null;

    if (userDetails == null) {
      res.render("Landing.ejs");
    } else {
      const allSkills = await Job.distinct("skills");
      let jobs;

      // Check if skills are selected for filtering
      const selectedSkills = req.query.skills;
      if (selectedSkills) {
        const skillsArray = Array.isArray(selectedSkills)
          ? selectedSkills.map((skill) => skill.toLowerCase())
          : [selectedSkills.toLowerCase()];

        // Find jobs matching any of the selected skills
        jobs = await Job.find({
          skills: { $in: skillsArray },
        });
      } else {
        // Fetch all jobs if no skills are selected
        jobs = await Job.find();
      }

      // Render the page with jobs and skills
      res.render("index.ejs", { jobs, allSkills, user: userDetails });
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/contact", async function (req, res) {
  res.render("contact.ejs");
});

app.get("/about", async function (req, res) {
  res.render("about.ejs");
});

app.get("/signup/student", (req, res) => {
  res.render("user/newStudent.ejs");
});

app.post("/signup/student", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      skills,
      education,
      experience,
      projects,
      bio,
      location,
    } = req.body;
    const role = "jobSeeker"; // Default role for recruiters
    // Create and save user
    const newStudent = new Student({
      name,
      email,
      password,
      role,
      skills,
      education,
      experience,
      projects,
      bio,
      location,
    });
    await newStudent.save();
    console.log("Recruiter created successfully:", newStudent);
    res.send("Recruiter created successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});
app.get("/signup/recruiter", (req, res) => {
  res.render("user/newRecruiter.ejs");
});

app.post("/signup/recruiter", async (req, res) => {
  try {
    const { name, email, password, companysize, company, bio, location } =
      req.body;
    const role = "recruiter"; // Default role for recruiters
    // Create and save user
    const newRecruiter = new Recruiter({
      name,
      email,
      password,
      role,
      company,
      bio,
      location,
      companysize,
    });
    await newRecruiter.save();
    console.log("Recruiter created successfully:", newRecruiter);
    res.send("Recruiter created successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

app.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/jobs/:id/apply", async (req, res) => {
  try {
    // Fetch the job details using the job ID from the URL
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).send("Job not found.");
    }

    // Render the apply.ejs template and pass the job details
    res.render("jobs/apply.ejs", { job });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the job details.");
  }
});

app.get("/candidates/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    const jobSkills = job.skills.map((skill) => new RegExp(`^${skill}$`, "i"));

    const candidates = await Student.find({
      "profile.skills": { $all: jobSkills },
    });

    if (!candidates) {
      return res.status(404).send("Job not found.");
    }

    res.render("candidates.ejs", { candidates });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("An error occurred while fetching the candidates details.");
  }
});

app.post("/jobs/:id/apply", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login"); // Redirect if not logged in
    }

    // Create a new application
    const application = new Application({
      job: req.params.id,
      applicant: req.user._id,
      resume: req.body.resume,
      additionalDetails: req.body.additionalDetails,
    });

    await application.save();
    res.redirect("/my-applications");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while applying for the job.");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    // Fetch jobs posted by the logged-in user
    const jobs = await Job.find({ postedBy: req.user._id });

    // Check if jobs exist
    if (!jobs.length) {
      return res.render("dashboard.ejs", { jobs: [], jobApplications: [] });
    }

    // Fetch applications for these jobs
    const jobApplications = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ job: job._id }).populate(
          "applicant"
        );
        return { job, applications };
      })
    );

    res.render("dashboard.ejs", { jobs, jobApplications });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while loading the dashboard.");
  }
});

app.get("/profile", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login"); // Redirect if not logged in
    }

    // Fetch applications made by the logged-in user

    const userDetails = req.user ? await Student.findById(req.user._id) : null;
    const applications = await Application.find({
      applicant: req.user._id,
    }).populate("job");
    const jobs = await Job.find({ postedBy: req.user._id });

    // Fetch applications for these jobs
    const jobApplications = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ job: job._id }).populate(
          "applicant"
        );
        return { job, applications };
      })
    );

    res.render("profile.ejs", { userDetails, applications, jobApplications });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while loading your applications.");
  }
});
app.get("/applicant/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL
    const userDetails = await Student.findById(userId);

    if (!userDetails) {
      return res.status(404).send("User not found.");
    }

    res.render("viewapplicant.ejs", { userDetails });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("An error occurred while fetching the applicant's profile.");
  }
});

app.get("/my-applications", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login"); // Redirect if not logged in
    }

    // Fetch applications made by the logged-in user
    const applications = await Application.find({
      applicant: req.user._id,
    }).populate("job");

    res.render("my-applications.ejs", { applications });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while loading your applications.");
  }
});

app.get("/employer/jobs/:id/applications", async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).send("Only employers can view applications.");
    }

    const job = await Job.findById(req.params.id).populate("postedBy");

    if (!job) {
      return res.status(404).send("Job not found.");
    }

    // Check if the logged-in user is the one who posted the job
    if (job.postedBy._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send("You are not authorized to view this job's applications.");
    }

    const applications = await Application.find({
      job: req.params.id,
    }).populate("applicant");

    res.render("jobs/applications", { job, applications });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching applications.");
  }
});

// New Job
app.get("/new/job", (req, res) => {
  res.render("jobs/newjob.ejs"); // Render the EJS form for adding jobs
});

app.post("/new/job", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const { title, company, location, description, skills, exp, salary } =
      req.body;

    // Create a new Job document
    const newJob = new Job({
      title,
      company,
      location,
      description,
      exp,
      salary,
      skills: skills.split(",").map((skill) => skill.trim()), // Convert comma-separated string to an array
      postedBy: req.user._id, // Associate the job with the logged-in user
    });

    // Save the job in the database
    await newJob.save();

    // Redirect to the dashboard or another route
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/job/:id", async (req, res) => {
  let { id } = req.params;
  let job = await Job.findById(id);
  let userAuth = false;
  // Check if the logged-in user is the one who posted the job

  if (req.user && job.postedBy._id.toString() === req.user._id.toString()) {
    userAuth = true;
  }

  res.render("jobs/viewjob.ejs", { job, userAuth }); // Render the EJS form for adding jobs
});

app.get("/job/:id/applications", async (req, res) => {
  try {
    const jobId = req.params.id;

    // Fetch the job details
    const job = await Job.findById(jobId);

    // Fetch applications for the specific job
    const applications = await Application.find({ job: jobId }).populate(
      "applicant"
    );

    res.render("jobs/viewapplications.ejs", {
      job,
      applications,
      userAuth: req.user && job.postedBy.toString() === req.user._id.toString(),
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).send("An error occurred while fetching applications.");
  }
});

// Delete
app.post("/jobs/:id/delete", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).send("Unauthorized");
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).send("Job not found.");
    }

    // Check if the logged-in user is the creator of the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to delete this job.");
    }

    await Job.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard"); // Redirect to the job listings page after deletion
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while deleting the job.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
