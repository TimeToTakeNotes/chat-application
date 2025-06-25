const express = require('express');

const { signup, login, logout, me } = require('../controllers/auth.js');
const { signupValidationRules, loginValidationRules, validate } = require('../middleware/validateAuthInput.js');

const router = express.Router();

router.post('/signup', signupValidationRules, validate, signup);
router.post('/login', loginValidationRules, validate, login);
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;