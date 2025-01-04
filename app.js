var express = require("express"),
  engine = require("ejs-mate"),
  app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport"); // Adjust path as needed

const flash = require("connect-flash");

const bodyParser = require("body-parser");
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secretcode", // Use a secure secret
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user || null; // Pass user to all views
  next();
});

app.use(flash());
const User = require("./models/user");
const Job = require("./models/job");
const Application = require("./models/application");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/job-search-platform", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

    const userDetails = req.user ? await User.findById(req.user._id) : null;

    // Render the page with jobs and skills
    res.render("index.ejs", { jobs, allSkills, user: userDetails });
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

app.get("/signup", (req, res) => {
  res.render("user/newuser.ejs");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, skills, company, bio, location } =
      req.body;

    // Prepare profile based on role
    const profile = {};
    if (role === "jobSeeker") {
      profile.skills = skills
        ? skills.split(",").map((skill) => skill.trim())
        : [];
    } else if (role === "employer") {
      profile.company = company;
    }
    profile.bio = bio;
    profile.location = location;

    // Create and save user
    const newUser = new User({ name, email, password, role, profile });
    await newUser.save();
    res.send("User created successfully!");
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

    const userDetails = req.user ? await User.findById(req.user._id) : null;
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

app.listen(3000);
