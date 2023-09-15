const express = require("express");
const {
  activeUserAccountByCode,
  activeUserAccountByURL,
  findAccount,
  me,
  passwordReset,
  passwordResetRequest,
  resendActivationCode,
  userLogin,
  userLogout,
  userRegister,
  dashboardLogin,
} = require("../controllers/auth.controllers.js");
const {
  userLoginValidator,
  userRegisterValidator,
  userResendCodeValidator,
  userVerifyCodeValidator,
  findAccountValidator,
  passwordResetRequestValidator,
  passwordResetValidator,
} = require("../middlewares/validator/file/user.validator.js");
const runValidation = require("../middlewares/validator/validation.js");
const limiter = require("../middlewares/limiter.js");
const { isLoggedIn, isLoggedOut } = require("../middlewares/verify.js");

const authRouter = express.Router();

// user register
authRouter
  .route("/register")
  .post(
    isLoggedOut,
    userRegisterValidator,
    runValidation,
    limiter(100),
    userRegister
  );

// active user account by URL
authRouter.route("/activate/:token").get(isLoggedOut, activeUserAccountByURL);

// active user account by code
authRouter
  .route("/activate")
  .post(
    isLoggedOut,
    userVerifyCodeValidator,
    runValidation,
    activeUserAccountByCode
  );

// resend verification code  to email
authRouter
  .route("/resend-active-code")
  .post(isLoggedOut, userResendCodeValidator, resendActivationCode);

// user login
authRouter
  .route("/login")
  .post(
    isLoggedOut,
    userLoginValidator,
    runValidation,
    limiter(100),
    userLogin
  );

// dashboard login
authRouter
  .route("/dashboard-login")
  .post(
    isLoggedOut,
    userLoginValidator,
    runValidation,
    limiter(100),
    dashboardLogin
  );

// find account
authRouter
  .route("/find-account")
  .post(isLoggedOut, findAccountValidator, runValidation, findAccount);

// user logout
authRouter.route("/logout").post(isLoggedIn, userLogout);

// password reset code
authRouter
  .route("/password-reset-code")
  .post(
    isLoggedOut,
    passwordResetRequestValidator,
    runValidation,
    passwordResetRequest
  );

// password reset
authRouter
  .route("/password-reset")
  .post(isLoggedOut, passwordResetValidator, runValidation, passwordReset);

// logged in user
authRouter.route("/me").get(isLoggedIn, me);

module.exports = authRouter;
