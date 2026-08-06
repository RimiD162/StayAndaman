export default function isAdminLoggedIn(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  // Return JSON error for API routes instead of redirecting
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  res.redirect("/admin/login");
}
