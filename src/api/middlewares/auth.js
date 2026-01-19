// api/middlewares/validators/authValidator.js
const validator = require('validator');

const validateSignup = (req, res, next) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;
    
    // First name validation
    if (!firstName || firstName.length < 2 || firstName.length > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name must be 2-50 characters' 
      });
    }
    
    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address' 
      });
    }
    
    // Password strength
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be strong (min 8 chars, upper, lower, number, symbol)' 
      });
    }
    
    // Age validation
    if (age < 18 || age > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Age must be 18-100' 
      });
    }
    
    next(); // All validations passed
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Validation error' 
    });
  }
};

module.exports = { validateSignup };