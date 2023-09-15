const dotenv = require("dotenv");

// config dotenv
dotenv.config(); 

const port = process.env.SERVER_PORT || 5000;
const mongoURL = process.env.MONGO_URI;

const jwtSecret = process.env.JWT_SECRET_KEY;
const jwtVerifyTokenExpire = process.env.VERIFY_JWT_EXPIRE;
 
// account verification key and expire
const verifyKey = process.env.JWT_VERIFY_SECRET_KEY;
const verifyKeyExpire = process.env.VERIFY_JWT_EXPIRE;
 
const passwordResetKey = process.env.PASSWORD_RESET_KEY;
const passwordResetExpire = process.env.PASSWORD_RESET_EXPIRE;

const jwtLoginTokenSecret = process.env.JWT_LOGIN_SECRET_KEY;
const jwtLoginTokenExpire = process.env.JWT_LOGIN_EXPIRE;

const jwtPasswordResetSecret = process.env.JWT_PASS_RESET_KEY;
const jwtPasswordResetExpire = process.env.JWT_PASS_RESET_KEY_EXPIRE; 

const jwtResetPasswordSecret = process.env.JWT_RESET_PASSWORD_SECRET_KEY;
const jwtResetPasswordExpire = process.env.JWT_RESET_PASSWORD_EXPIRE;

const clientURL = process.env.CLIENT_URL;


const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const emailUser = process.env.EMAIL_HOST_USER; 
const emailPass = process.env.EMAIL_HOST_PASSWORD;

const defaultUserPhoto = process.env.DEFAULT_USER_PHOTO;

module.exports = {
  port,
  mongoURL,  
  jwtSecret,
  jwtVerifyTokenExpire,
  passwordResetKey,
  passwordResetExpire,
  jwtLoginTokenSecret,
  jwtLoginTokenExpire,
  jwtPasswordResetSecret,
  jwtPasswordResetExpire,
  jwtResetPasswordSecret,
  jwtResetPasswordExpire,
  clientURL,
  smtpHost,
  smtpPort,
  emailUser,
  emailPass,
  defaultUserPhoto,
  verifyKey,
  verifyKeyExpire,
};
 