export default function isUserLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  // Return JSON error for API and AJAX booking routes instead of redirecting with HTML
  const isApiOrAjax =
    req.path.startsWith("/api/") ||
    req.path.startsWith("/booking/") ||
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.headers["content-type"] && req.headers["content-type"].includes("application/json"));

  if (isApiOrAjax) {
    return res.status(401).json({
      success: false,
      error: "You must be logged in to book. Please sign in.",
      redirect: `/user/login?redirect=${encodeURIComponent(req.headers.referer || req.originalUrl)}`
    });
  }

  // Save the originally requested page to redirect back after login
  const redirectTarget = req.originalUrl || "/home/hotel";
  if (req.session) {
    req.session.redirectTo = redirectTarget;
  }
  res.redirect(`/user/login?redirect=${encodeURIComponent(redirectTarget)}`);
}
