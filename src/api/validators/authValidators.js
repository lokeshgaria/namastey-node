//NEW VALIDATION VALIDATIONS

const validator = require("validator");

const validateSignupData = (req, res, next) => {
  const { firstName, lastName, email, password, age } = req.body;
  const errors = [];

  // Validation rules configuration
  const validations = [
    {
      field: "firstName",
      value: firstName,
      rules: [
        { check: !firstName, message: "First name is required" },
        {
          check: firstName && firstName.trim().length < 3,
          message: "First name must be at least 3 characters",
        },
        {
          check: firstName && firstName.trim().length > 50,
          message: "First name cannot exceed 50 characters",
        },
        {
          check: firstName && !/^[a-zA-Z\s'-]+$/.test(firstName.trim()),
          message: "First name contains invalid characters",
        },
      ],
    },
    {
      field: "lastName",
      value: lastName,
      rules: [
        { check: !lastName, message: "Last name is required" },
        {
          check: lastName && lastName.trim().length < 3,
          message: "Last name must be at least 3 characters",
        },
        {
          check: lastName && lastName.trim().length > 50,
          message: "Last name cannot exceed 50 characters",
        },
        {
          check: lastName && !/^[a-zA-Z\s'-]+$/.test(lastName.trim()),
          message: "Last name contains invalid characters",
        },
      ],
    },
    {
      field: "email",
      value: email,
      rules: [
        { check: !email, message: "Email is required" },
        {
          check: email && !validator.isEmail(email.trim()),
          message: "Invalid email address format",
        },
        {
          check: email && email.trim().length > 255,
          message: "Email cannot exceed 255 characters",
        },
      ],
    },
    {
      field: "password",
      value: password,
      rules: [
        { check: !password, message: "Password is required" },
        {
          check: password && password.length < 8,
          message: "Password must be at least 8 characters",
        },
        {
          check: password && password.length > 128,
          message: "Password cannot exceed 128 characters",
        },
        {
          check: password && !/[A-Z]/.test(password),
          message: "Password must contain at least one uppercase letter",
        },
        {
          check: password && !/[a-z]/.test(password),
          message: "Password must contain at least one lowercase letter",
        },
        {
          check: password && !/\d/.test(password),
          message: "Password must contain at least one number",
        },
        {
          check: password && !/[!@#$%^&*(),.?":{}|<>]/.test(password),
          message: "Password must contain at least one special character",
        },
        {
          check: password && /\s/.test(password),
          message: "Password cannot contain spaces",
        },
      ],
    },
    {
      field: "age",
      value: age,
      rules: [
        {
          check: age === undefined || age === null || age === "",
          message: "Age is required",
        },
        { check: isNaN(Number(age)), message: "Age must be a valid number" },
        { check: Number(age) < 18, message: "Age must be at least 18" },
        { check: Number(age) > 100, message: "Age cannot exceed 100" },
      ],
    },
  ];

  // Run all validations
  validations.forEach(({ field, value, rules }) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    rules.forEach((rule) => {
      if (rule.check) {
        errors.push({
          field,
          value: trimmedValue,
          message: rule.message,
        });
      }
    });
  });

  // If there are errors, return them in a structured way
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  // Trim string values and attach validated data to request
  req.validatedData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    password: password, // Don't trim password (spaces might be intentional)
    age: Number(age),
  };

  next();
};

const validateProfileEditData = (req, res, next) => {
    const allowedFields = [
        "firstName",
        "lastName",
        "age",
        "about",
        "skills",
        "photoUrl",
        "gender",
    ];
    
    const errors = [];
    const updateData = {};
    
    // Check if there are any invalid fields
    const requestFields = Object.keys(req.body);
    const invalidFields = requestFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid fields in update",
            invalidFields: invalidFields,
            allowedFields: allowedFields
        });
    }
    
    // Validate individual fields if they are provided
    if (req.body.firstName !== undefined) {
        const firstName = req.body.firstName.trim();
        if (!firstName || firstName.length < 2) {
            errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
        } else if (firstName.length > 50) {
            errors.push({ field: 'firstName', message: 'First name cannot exceed 50 characters' });
        } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
            errors.push({ field: 'firstName', message: 'First name contains invalid characters' });
        } else {
            updateData.firstName = firstName;
        }
    }
    
    if (req.body.lastName !== undefined) {
        const lastName = req.body.lastName.trim();
        if (!lastName || lastName.length < 2) {
            errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
        } else if (lastName.length > 50) {
            errors.push({ field: 'lastName', message: 'Last name cannot exceed 50 characters' });
        } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
            errors.push({ field: 'lastName', message: 'Last name contains invalid characters' });
        } else {
            updateData.lastName = lastName;
        }
    }
    
    if (req.body.age !== undefined) {
        const age = parseInt(req.body.age);
        if (isNaN(age)) {
            errors.push({ field: 'age', message: 'Age must be a valid number' });
        } else if (age < 13) {
            errors.push({ field: 'age', message: 'Age must be at least 13' });
        } else if (age > 120) {
            errors.push({ field: 'age', message: 'Age cannot exceed 120' });
        } else {
            updateData.age = age;
        }
    }
    
    if (req.body.about !== undefined) {
        const about = req.body.about.trim();
        if (about.length > 2000) {
            errors.push({ field: 'about', message: 'About section cannot exceed 2000 characters' });
        } else {
            updateData.about = about;
        }
    }
    
    if (req.body.skills !== undefined) {
        // Skills can be an array or comma-separated string
        let skills = req.body.skills;
        if (typeof skills === 'string') {
            skills = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
        }
        
        if (!Array.isArray(skills)) {
            errors.push({ field: 'skills', message: 'Skills must be an array or comma-separated string' });
        } else if (skills.length > 20) {
            errors.push({ field: 'skills', message: 'Cannot have more than 20 skills' });
        } else if (skills.some(skill => skill.length > 50)) {
            errors.push({ field: 'skills', message: 'Each skill must be under 50 characters' });
        } else {
            updateData.skills = skills;
        }
    }
    
    if (req.body.photoUrl !== undefined) {
        const photoUrl = req.body.photoUrl.trim();
        if (photoUrl && !validator.isURL(photoUrl, { 
            protocols: ['http', 'https'],
            require_protocol: true 
        })) {
            errors.push({ field: 'photoUrl', message: 'Photo URL must be a valid URL with http/https' });
        } else {
            updateData.photoUrl = photoUrl || null; // Allow empty string to clear photo
        }
    }
    
    if (req.body.gender !== undefined) {
        const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
        const gender = req.body.gender.toLowerCase();
        if (!validGenders.includes(gender)) {
            errors.push({ 
                field: 'gender', 
                message: 'Gender must be one of: ' + validGenders.join(', ') 
            });
        } else {
            updateData.gender = gender;
        }
    }
    
    // Check if no fields were provided
    if (requestFields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No fields provided for update"
        });
    }
    
    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
        });
    }
    
    // Attach validated data to request object
    req.validatedUpdateData = updateData;
    next();
};

module.exports = {
  validateSignupData,
  validateProfileEditData,
};
