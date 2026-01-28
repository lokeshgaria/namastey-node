module.exports = {
  USER_SAFE_DATA: 'firstName lastName age photoUrl skills about email',
  
  CONNECTION_STATUS: {
    INTERESTED: 'interested',
    IGNORED: 'ignored',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
  },
  
  ALLOWED_PROFILE_FIELDS: [
    'firstName', 'lastName', 'age', 
    'about', 'skills', 'photoUrl', 'gender'
  ],
  
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
  }
};