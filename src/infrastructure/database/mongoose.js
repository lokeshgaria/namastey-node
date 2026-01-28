const mongoose = require('mongoose');

// Setup mongoose plugins or configurations
mongoose.set('strictQuery', false);

// Add global plugins if needed
mongoose.plugin((schema) => {
  schema.set('timestamps', true);
});

module.exports = mongoose;