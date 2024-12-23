var express = require("express"),
  engine = require("ejs-mate"),
  app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('./config/passport'); // Adjust path as needed

const bodyParser = require("body-parser");
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
      secret: 'secretcode', // Use a secure secret
      resave: false,
      saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user || null; // Pass user to all views
  next();
});

const User = require("./models/user");
const Job = require('./models/job');

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

  
app.get("/", async function (req, res) {
  try {
    // Fetch all users from the database
    const jobs = await Job.find();

    // Render the index.ejs file with the fetched users
    res.render("index.ejs", { jobs, user: req.user || null});
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
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
    '/users/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

// Logout route
app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

app.get("/jobs/:id/apply", async(req, res) => {
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
    if (!req.user || req.user.role !== "jobSeeker") {
      return res.status(403).send("Only job seekers can apply for jobs.");
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send("Job not found.");
    }

    const application = {
      jobSeekerId: req.user._id,
      name: req.user.name, // Assuming the user schema has a 'name' field
      email: req.user.email, // Assuming the user schema has an 'email' field
      resume: req.body.resume || "",
      additionalDetails: req.body.additionalDetails || "",
    };

    job.applications.push(application);
    await job.save();

    res.redirect("/"); // Redirect to the jobs page or a success page
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while applying.");
  }
});


app.get("/employer/jobs/:id/applications", async (req, res) => {
  try {
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).send("Only employers can view applications.");
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send("Job not found.");
    }

    res.render("jobs/applications.ejs", { job });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching applications.");
  }
});

// New Job
app.get('/new/job', (req, res) => {
  res.render('jobs/newjob.ejs'); // Render the EJS form for adding jobs
});

app.post('/new/job', async (req, res) => {
  try {
      const { title, company, location, description, skills, exp, salary } = req.body;

      // Create a new Job document
      const newJob = new Job({
          title,
          company,
          location,
          description,
          exp,
          salary,
          skills: skills.split(',').map(skill => skill.trim()) // Convert comma-separated string to an array
      });

      // Save the job in the database
      await newJob.save();

      // Redirect to the homepage or another route after saving
      res.redirect('/');
  } catch (error) {
      console.error('Error adding job:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/job/:id', async (req, res) => {
  let {id }= req.params;
  let job = await Job.findById(id);
  res.render('jobs/viewjob.ejs', {job}); // Render the EJS form for adding jobs
});

app.listen(3000);
