const express = require("express");
const {
  addUser,
  allUsers,
  banUserById,
  deleteUserById,
  findUserById,
  forgotPassword,
  resendPasswordResetCode,
  resetPasswordByCode,
  unbannedUserById,
  updateUserById,
  updateUserPassword,
  updateUserRole,
} = require("../controllers/user.controllers.js");
const {
  resetPasswordValidatorByCode,
  resetPasswordValidatorByURL,
  userRegisterValidator,
  userResetPasswordValidator,
} = require("../middlewares/validator/file/user.validator.js");
const runValidation = require("../middlewares/validator/validation.js");
const { isLoggedIn, isLoggedOut } = require("../middlewares/verify.js");
const { authorization } = require("../middlewares/authorization.js");
const { userMulter } = require("../utils/multer.js");

const userRouter = express.Router();

// routes
userRouter
  .route("/")
  .get(isLoggedIn, authorization("admin", "superAdmin"), allUsers)
  .post(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    userRegisterValidator,
    runValidation,
    addUser
  );

// update password
userRouter.route("/password-update").patch(isLoggedIn, updateUserPassword);

// forgot password
userRouter
  .route("/forgot-password")
  .post(userResetPasswordValidator, runValidation, forgotPassword);

// reset password by code
userRouter
  .route("/reset-password")
  .post(resetPasswordValidatorByCode, runValidation, resetPasswordByCode);

// resend password reset code
userRouter.route("/resend-password-reset-code").post(resendPasswordResetCode);

// reset password by URL
userRouter
  .route("/reset-password/:token")
  .patch(resetPasswordValidatorByURL, runValidation, resetPasswordByCode);

// ban user by id
userRouter
  .route("/ban/:id")
  .patch(isLoggedIn, authorization("admin", "superAdmin"), banUserById);
 
// unbanned user by id
userRouter
  .route("/unban/:id")
  .patch(isLoggedIn, authorization("admin", "superAdmin"), unbannedUserById);


  // user role update 
userRouter
  .route("/role-update/:id")
  .patch(isLoggedIn, authorization("superAdmin"), updateUserRole);

  // update credential data
userRouter
  .route("/credential-update/:id")
  .patch(isLoggedIn, authorization("superAdmin"), updateUserById);




// find user by id and update and delete
userRouter
  .route("/:id")
  .get(isLoggedIn, findUserById)
  .patch(isLoggedIn, userMulter, updateUserById)
  .delete(isLoggedIn, deleteUserById);

// export
module.exports = userRouter;
 