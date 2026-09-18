
// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
  console.log("isAuthenticated.session=", req.session);
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Middleware to reset session timeout on activity
exports.resetSessionTimeout = (req, res, next) => {
  req.session.touch();
  next();
}