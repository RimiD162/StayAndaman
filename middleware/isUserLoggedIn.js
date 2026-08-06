export default function isUserLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // Return JSON error for API routes instead of redirecting
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  // Save the originally requested page to redirect back after login
  if (req.session) {
    req.session.redirectTo = req.originalUrl;
  }
  res.redirect("/user/login");
}
