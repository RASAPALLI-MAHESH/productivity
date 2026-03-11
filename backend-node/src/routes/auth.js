'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const {
  signupSchema, loginSchema, verifyOtpSchema, resendOtpSchema,
  forgotPasswordSchema, verifyResetOtpSchema, resetPasswordSchema, googleAuthSchema,
} = require('../validators/authValidator');

const router = Router();

router.post('/signup',            validate(signupSchema),          ctrl.signup);
router.post('/resend-otp',        validate(resendOtpSchema),       ctrl.resendOtp);
router.post('/verify-otp',        validate(verifyOtpSchema),       ctrl.verifyOtp);
router.post('/login',             validate(loginSchema),           ctrl.login);
router.post('/google',            validate(googleAuthSchema),      ctrl.googleAuth);
router.post('/refresh',           ctrl.refresh);
router.post('/logout',            ctrl.logout);
router.post('/forgot-password',   validate(forgotPasswordSchema),  ctrl.forgotPassword);
router.post('/verify-reset-otp',  validate(verifyResetOtpSchema),  ctrl.verifyResetOtp);
router.post('/reset-password',    validate(resetPasswordSchema),   ctrl.resetPassword);

module.exports = router;
