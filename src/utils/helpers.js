// Generate random string
const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Sanitize user object
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

module.exports = {
  generateRandomString,
  formatDate,
  sanitizeUser
};

// UPDATE THESE LATER