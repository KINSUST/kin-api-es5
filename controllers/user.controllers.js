const User = require("../model/user.model.js");
const createError = require("http-errors");
const {
  errorResponse,
  successResponse,
} = require("../services/responseHandler.js");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const notExistData = require("../services/notExistData.js");
const checkMongoId = require("../services/checkMongoId.js");
const bcrypt = require("bcryptjs");
const existData = require("../services/existData.js");
const deleteImage = require("../helper/deleteImage.js");
const filterQuery = require("../helper/filterQuery.js");
const { unlinkSync } = require("fs");
const path = require("path");
const hideFromUser = require("../helper/hideFromUser.js");
const createJWT = require("../helper/createJWT.js");
const randomHashCode = require("../helper/randomHashCode.js");
const {
  jwtPasswordResetExpire,
  jwtPasswordResetSecret,
  jwtResetPasswordSecret,
} = require("../secret.js");
const sendPasswordResetMail = require("../utils/email/passwordResetMail.js");
const checkImage = require("../services/imagesCheck.js");
const { log } = require("console");

/**
 *
 * @apiDescription    Get All Users Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/users
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 * @apiParams         [ search = string ]   search by name, email, mobile, role
 *
 * @apiSuccess        { success: true , message : User's Data Fetched Successfully , pagination: {}, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const allUsers = asyncHandler(async (req, res) => {
  // query filter
  const { queries, filters } = filterQuery(req);

  // find users
  const users = await User.find(filters)
    .sort(queries.sortBy)
    .skip(queries.skip)
    .limit(queries.limit)
    .select(queries.fields);

  // count documents
  const count = await User.countDocuments(filters);

  // user check
  if (!users.length) throw createError(404, "Couldn't find any data!");

  // page & limit
  const page = queries.page;
  const limit = queries.limit;

  // pagination
  const pagination = {
    totalDocuments: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
  };

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Users Data Fetched Successfully.",
    payload: {
      pagination: pagination,
      data: users,
    },
  });
});

/**
 *
 * @apiDescription    Add a new user
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/users
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiBody           { name, email, password, gender }
 *
 * @apiSuccess        { success: true , message: User account created successfully, data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const addUser = asyncHandler(async (req, res) => {
  // get email
  const { email } = req.body;

  // check if user exist
  await existData(User, { email }, "You are already registered!");

  // create user
  const newUser = await User.create({
    ...req.body,
    isVerified: true,
  });

  // response send
  successResponse(res, {
    statusCode: 201,
    message: "User account created successfully.",
    payload: {
      data: newUser,
    },
  });
});

/**
 *
 * @apiDescription    Get single user data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/users/:id
 * @apiAccess         Login user
 *
 * @apiParams         [ id = ObjectId ]
 *
 * @apiSuccess        { success: true, message : User's Data Fetched Successfully, data: { } }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const findUserById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find user by id
  let user = await User.findById(req.params.id);

  // user check
  await notExistData(
    User,
    { _id: `${req.params.id}` },
    "Couldn't fine any data!"
  );

  // hide form user
  if (!(req.me.role === "admin" || req.me.role === "superAdmin")) {
    const {
      role,
      isBanned,
      isEC,
      isVerified,
      trash,
      createdAt,
      updatedAt,
      __v,
      _id,
      approve,
      ...userData
    } = user._doc;
    user = userData;
  }

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "User Data Fetched Successfully.",
    payload: {
      data: user,
    },
  });
});

/**
 *
 * @apiDescription    Update user data
 * @apiMethod          PATCH
 *
 * @apiRoute          /api/v1/users/:id
 * @apiAccess         Login user
 *
 * @apiParams         [ id = ObjectId ]
 * @apiBody           { any fields date }
 *
 * @apiSuccess        { success: true , message :  User data is successfully updated, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const updateUserById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // user check by id
  const user = await User.findById(req.params.id);

  // if user not found
  if (!user) throw createError(404, "Couldn't find any data!");

  // if user is not admin or superAdmin
  if (!(req.me.role === "admin" || req.me.role === "superAdmin")) {
    const immutableFields = [
      "role",
      "isVerified",
      "trash",
      "createAt",
      "updatedAt",
      "_v",
    ];
    Object.keys(req.body).forEach((field) => {
      if (immutableFields.includes(field)) {
        throw createError(401, `you can't update ${field} field.`);
      }
    });
  }

  //  Only superAdmin change  role.
  if (!(req.me.role === "superAdmin") && req.body.role) {
    throw createError(406, "You can't change your role.");
  }

  // update options
  const options = {
    $set: {
      ...req.body,
      user_photo: req.file?.filename,
    },
  };

  // update user
  const updatedUser = await User.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // find image in folder & delete
  req.file &&
    checkImage("users").find((image) => image === user?.user_photo) &&
    unlinkSync(path.resolve(`./public/images/users/${user?.user_photo}`));

  // hide form users
  hideFromUser(updatedUser, [
    "role",
    "isBanned",
    "isEC",
    "isVerified",
    "trash",
    "__v",
    "isEC",
    "approve",
  ]);

  // response send
  successResponse(res, {
    statusCode: 200,
    message: "User data is successfully updated.",
    payload: {
      data: updatedUser,
    },
  });
});

/**
 *
 * @apiDescription    Delete user data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/users/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiParams         [ id = ObjectId ]
 *
 * @apiSuccess        { success: true , message :  User account is successfully deleted, data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const deleteUserById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  //  user check
  const user = await User.findById(req.params.id);

  // user check
  if (!user) {
    throw createError(404, "Couldn't find any data");
  }

  // never delete superAdmin account
  if (user.role === "superAdmin") {
    throw createError(400, "Can't delete this account.");
  }

  // delete user
  const deletedUser = await User.findByIdAndDelete({
    _id: req.params.id,
    role: "superAdmin",
  });

  // find image in folder & delete
  checkImage("users").find((image) => image === user?.user_photo) &&
    unlinkSync(path.resolve(`./public/images/users/${user?.user_photo}`));

  // response
  successResponse(res, {
    statusCode: 200,
    message: "User account is successfully deleted.",
    payload: {
      data: deletedUser,
    },
  });
});

/**
 *
 * @apiDescription    Update user password
 * @apiMethod         PUT || PATCH
 *
 * @apiRoute          /api/v1/users/:id
 * @apiAccess         Only login owner
 *
 * @apiSuccess        { success: true , message:  Password updated successfully, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data.
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data.
 * @apiError          ( Not Found: 404 )      Couldn't find any data!.
 *
 */

const updateUserPassword = asyncHandler(async (req, res) => {
  // user id from token
  const userId = req.me._id;

  // update options
  const options = {
    $set: {
      password: req.body.password,
    },
  };

  // update user
  const updatedUser = await User.findByIdAndUpdate(userId, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // response
  successResponse(res, {
    statusCode: 200,
    message: "Password updated successfully.",
    payload: {
      data: updatedUser,
    },
  });
});

// forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // check email
  await notExistData(
    User,
    { email },
    "Email not found. Please register first."
  );

  // random hash code
  const { code, hashCode } = randomHashCode(4);

  // create  password reset token
  const passwordResetToken = createJWT(
    { email, code: hashCode },
    jwtPasswordResetSecret,
    jwtPasswordResetExpire
  );

  // prepare email data
  const emailData = {
    email,
    subject: "Password Reset Link",
    code,
    passwordResetToken,
  };

  // send email
  await sendPasswordResetMail(emailData);

  // cookie set
  res.cookie("passwordResetToken ", passwordResetToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 5, // 5 min
    secure: false, // only https
    sameSite: "strict",
  });

  // response
  successResponse(res, {
    statusCode: 200,
    message: "Password reset link has been sent to your email.",
  });
});

// reset password by code
const resetPasswordByCode = asyncHandler(async (req, res) => {
  const { code, password } = req.body;

  // check cookie
  const token = req.cookies.passwordResetToken;

  if (!token) {
    throw createError(401, "Access token not found.");
  }

  // verify token
  jwt.verify(token, jwtPasswordResetSecret, async (err, decode) => {
    if (err) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Token expired. Please try again.",
      });
    }

    // code check
    const isMatch = await bcrypt.compare(code, decode.code);

    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid code. Please try again.",
      });
    }

    // update options
    const options = {
      $set: {
        password,
      },
    };

    // update user
    const user = await User.findOneAndUpdate({ email: decode.email }, options, {
      new: true,
      runValidators: true,
      context: "query",
    });

    // response
    successResponse(res, {
      statusCode: 200,
      message: "Password updated successfully.",
      payload: {
        data: user,
      },
    });
  });
});

// reset password by URL
const resetPasswordByURL = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // check cookie
  const token = req.params.token;

  if (!token) {
    throw createError(401, "Access token not found.");
  }

  // verify token
  jwt.verify(token, jwtResetPasswordSecret, async (err, decode) => {
    if (err) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Token expired. Please try again.",
      });
    }

    // update options
    const options = {
      $set: {
        password,
      },
    };

    // update user
    const user = await User.findOneAndUpdate({ email: decode.email }, options, {
      new: true,
      runValidators: true,
      context: "query",
    });

    // response
    successResponse(res, {
      statusCode: 200,
      message: "Password updated successfully.",
      payload: {
        data: user,
      },
    });
  });
});

// resend password reset code
const resendPasswordResetCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw createError(
      400,
      "Email is required.Please enter your email address."
    );
  }

  const user = await User.findOne({ email });

  // check: user is exist or not.
  if (!user) {
    throw createError(400, "Couldn't find any user account!. Please register.");
  }

  // random hash code
  const { code, hashCode } = randomHashCode(4);

  // create verify token
  const passwordResetToken = createJWT(
    { email, code: hashCode },
    jwtPasswordResetSecret,
    jwtPasswordResetExpire
  );

  // prepare email data
  const emailData = {
    email,
    subject: "Account Activation Link",
    code,
    passwordResetToken,
  };

  // send email
  sendPasswordResetMail(emailData);

  res.cookie("passwordResetToken", passwordResetToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 5, // 5 min
    secure: false, // only https
    sameSite: "strict",
  });

  // response send
  successResponse(res, {
    statusCode: 200,
    message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
  });
});

/**
 *
 * @apiDescription    Ban user account
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/users/ban/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiParams         [ id = ObjectId ]
 *
 * @apiSuccess        { success: true , message :  User account is successfully banned, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const banUserById = asyncHandler(async (req, res) => {
  // id validation
  checkMongoId(req.params.id);

  //  user check

  const user = await User.findById(req.params.id);

  if (!user) {
    throw createError(404, "Couldn't find any data");
  }

  if (user.role === "superAdmin") {
    throw createError(400, "You can't ban this account.");
  }

  // check user is banned or not

  if (user.isBanned) {
    throw createError(400, "User is already banned");
  }

  // update options
  const options = {
    $set: {
      isBanned: true,
    },
  };

  // update user
  const bannedUser = await User.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // response
  successResponse(res, {
    statusCode: 200,
    message: "User account is successfully banned.",
    payload: {
      data: bannedUser,
    },
  });
});

/**
 *
 * @apiDescription    Unbanned user account
 * @apiMethod         PUT || PATCH
 *
 * @apiRoute          /api/v1/users/unban/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiParams         [ id = ObjectId ]
 *
 * @apiSuccess        { success: true , message :  User account is successfully unbanned, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const unbannedUserById = asyncHandler(async (req, res) => {
  // id validation
  checkMongoId(req.params.id);

  //  user check
  const user = await User.findById(req.params.id);

  if (!user) {
    throw createError(404, "Couldn't find any data");
  }

  // check user is banned or not

  if (!user.isBanned) {
    throw createError(400, "User is already unbanned");
  }

  // update options
  const options = {
    $set: {
      isBanned: false,
    },
  };

  // update user
  const unbannedUser = await User.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // response
  successResponse(res, {
    statusCode: 200,
    message: "User Unbanned Successfully",
    payload: {
      data: unbannedUser,
    },
  });
});

// bulk delete
const BulkDeleteUserByIds = asyncHandler(async (req, res) => {
  // id validation
  // checkMongoId(req.params.id);

  //  user check

  // await notExistData(User, {_id: `${req.params.id}` }, "Couldn't find any data");

  ids = ["123", "234", "345"];

  // delete user
  const deletedUser = await User.deleteMany({
    _id: { $in: ids },
    role: "superAdmin",
  });

  console.log(deletedUser);
  // image delete
  const imagePath = `/public/images/users/${deletedUser?.photo}`;

  deletedUser?.photo && deleteImage(imagePath);

  // response
  successResponse(res, {
    statusCode: 200,
    message: "User account is successfully deleted.",
    payload: {
      data: deletedUser,
    },
  });
});

// role update
const updateUserRole = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  //  user check by id
  const user = await User.findById(req.params.id);

  // if user not found
  if (!user) throw createError(404, "Couldn't find any data");

  if (user.email === "kinsust03@gmail.com" && user.role === "superAdmin") {
    throw createError(400, "You can't change this account role.");
  }

  // update options
  const options = {
    $set: {
      role: req.body.role,
    },
  };

  // update user
  const updatedData = await User.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // response
  successResponse(res, {
    statusCode: 200,
    message: "User role updated successfully.",
    payload: {
      data: updatedData,
    },
  });
});

// update credential data
const updateCredentialData = asyncHandler(async (req, res) => {
  // id validation
  checkMongoId(req.params.id);

  //  user check
  const user = await User.findById(req.params.id);

  if (!user) {
    throw createError(404, "Couldn't find any data");
  }

  // update options
  const options = {
    $set: {
      ...req.body,
    },
  };

  // update user
  const updatedUser = await User.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // response
  successResponse(res, {
    statusCode: 200,
    message: "Successfully Role Updated.",
    payload: {
      data: updatedUser,
    },
  });
});

module.exports = {
  allUsers,
  addUser,
  findUserById,
  updateUserById,
  deleteUserById,
  updateUserPassword,
  forgotPassword,

  resetPasswordByCode,
  resetPasswordByURL,
  resendPasswordResetCode,
  banUserById,
  unbannedUserById,
  BulkDeleteUserByIds,
  updateUserRole,
  updateCredentialData,
};
