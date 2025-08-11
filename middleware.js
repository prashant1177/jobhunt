function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function ensureEmployer(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "employer") return next();
  res.status(403).send("Access Denied");
}

module.exports = { ensureAuthenticated, ensureEmployer, generateResume };
