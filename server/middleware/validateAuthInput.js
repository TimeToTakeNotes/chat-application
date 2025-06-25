const { body, validationResult } = require('express-validator');

const signupValidationRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),

  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),

  body('emailAddress')
    .trim()
    .isEmail().withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('confirmPassword')
    .custom((value, { req }) => {
      console.log('Password:', req.body.password, 'Confirm:', value);
      return value === req.body.password;
    })
    .withMessage('Passwords do not match')
];

const loginValidationRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map(err => err.msg);
    return res.status(400).json({ message: extracted.join(', ') });
  }
  next();
};

module.exports = {
  signupValidationRules,
  loginValidationRules,
  validate
};