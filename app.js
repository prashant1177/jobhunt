var express = require("express"),
  engine = require("ejs-mate"),
  app = express();
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    res.render("index.ejs", { jobs });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/users/new", (req, res) => {
  res.render("user/newuser.ejs");
});

app.post("/users", async (req, res) => {
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

app.listen(3000);
