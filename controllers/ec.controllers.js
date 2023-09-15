const Ec = require("../model/ec.model.js");
const createError = require("http-errors");
const asyncHandler = require("express-async-handler");
const notExistData = require("../services/notExistData.js");
const checkMongoId = require("../services/checkMongoId.js");
const { successResponse } = require("../services/responseHandler.js");
const existData = require("../services/existData.js");
const userModel = require("../model/user.model.js");

/**
 *
 * @apiDescription    Get All Ec Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/ec
 * @apiAccess         public
 *
 * @apiSuccess        { success: true , message : EC's Data Fetched Successfully. , data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const getAllEc = asyncHandler(async (req, res) => {
  // ec data find
  const ec = await Ec.find().sort({ year: -1 }).populate("members.user");

  // if no data found
  if (!ec.length) throw createError(404, "Couldn't find any data!");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "EC's Data Fetched Successfully.",
    payload: {
      data: ec,
    },
  });
});

/**
 *
 * @apiDescription    Add a new ec
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/ec
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiBody           { name, year, member }
 *
 * @apiSuccess        { success: true , message: New ec added successfully, data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const addEc = asyncHandler(async (req, res) => {
  // name exist check
  await existData(Ec, { name: req.body.name }, "This name already exists");

  // create new ec
  const ec = await Ec.create(req.body);

  // if ec not created
  if (!ec) throw createError(400, "Couldn't add new ec.");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "New ec added successfully",
    payload: {
      data: ec,
    },
  });
});

/**
 *
 * @apiDescription    Get ec data by id
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/ec/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiSuccess        { success: true , message : EC Data Fetched Successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const ECFindById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find ec data by id
  const data = await Ec.findById(req.params.id).populate("members.user");

  // if no data found
  if (!data) throw createError(404, "Couldn't find any data!");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "EC Data Fetched Successfully.",
    payload: {
      data: data,
    },
  });
});

/**
 *
 * @apiDescription    Update EC data
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/ec/:id
 * @apiAccess          Admin || SuperAdmin
 *
 * @apiParams         [ id = ObjectId ]
 * @apiBody           { any fields data }
 *
 * @apiSuccess        { success: true , message :  EC data is successfully updated, data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const updateEcById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // ec data find by id
  const ec = await Ec.findById(req.params.id);

  // if no data found
  if (!ec) throw createError(404, "Couldn't find any data!");

  // update options
  const options = {
    $set: {
      ...req.body,
    },
  };

  // update ec data
  const updatedEc = await Ec.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Ec data is successfully updated.",
    payload: {
      data: updatedEc,
    },
  });
});

/**
 *
 * @apiDescription    Delete ec data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/ec/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiParams         [ id = ObjectId ]
 *
 * @apiSuccess        { success: true , message :  Ec data is successfully deleted, data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const deleteEcById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find ec data by id
  const ec = await Ec.findById(req.params.id);

  // if no data found
  if (!ec) throw createError(404, "Couldn't find any data!");

  // delete ec data
  const deletedEc = await Ec.findByIdAndDelete(req.params.id);

  //  success response send
  successResponse(res, {
    statusCode: 200,
    message: "Ec Data is successfully deleted.",
    payload: {
      data: deletedEc,
    },
  });
});

/**
 *
 * @apiDescription    Add a member in ec
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/ec/add-member/:id    [ ec id ]
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiSuccess        { success: true , message : New member added successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */
const addMemberInEc = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find ec data by id
  const ec = await Ec.findById(req.params.id);

  // if no data found
  if (!ec) throw createError(404, "Couldn't find any data!");

  // member mongoose id check
  checkMongoId(req.body.user);

  // member data check
  const member = await userModel.findById(req.body.user);

  // if no member data found
  if (!member) throw createError(404, "Couldn't find any user data!");

  // member already exist check
  const exist = ec.members.find((member) => member.user == req.body.user);

  // if member already exist
  if (exist) throw createError(400, "Member already exist!");

  // options
  const options = {
    $push: {
      members: {
        ...req.body,
      },
    },
  };

  // update data
  const updatedData = await Ec.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  //  success response send
  successResponse(res, {
    statusCode: 200,
    message: "New member added successfully.",
    payload: {
      data: updatedData,
    },
  });
});

/**
 *
 * @apiDescription    Update member data in ec
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/ec/update-member/:id    [ member id ]
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiSuccess        { success: true , message : Member data updated. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const memberDataUpdateById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find ec data by member id
  const data = await Ec.find({
    "members._id": req.params.id,
  });

  // if no data found in ec members collection
  if (!data.length) throw createError(404, "Couldn't find any member data.");

  // replace data
  let replaceData = {};
  Object.keys(req.body).forEach((key) => {
    key.replace(key, `members.$.${key}`);
    const replace = key.replace(key, `members.$.${key}`);
    replaceData = {
      ...replaceData,
      [replace]: req.body[key],
    };
  });

  // update options
  const options = {
    $set: {
      ...replaceData,
    },
  };

  // update member data
  const updatedData = await Ec.findOneAndUpdate(
    { "members._id": req.params.id },
    options,
    {
      new: true,
      runValidators: true,
    }
  ).populate("members.user");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Member data updated.",
    payload: {
      data: updatedData,
    },
  });
});

/**
 *
 * @apiDescription    Remove a member from ec
 * @apiMethod         PUT || PATCH
 *
 * @apiRoute          /api/v1/ec/remove-member/:id    [ member id ]
 * @apiAccess          Admin || SuperAdmin
 *
 * @apiParams         [ id = ObjectId ]
 *
 * @apiSuccess        { success: true , message :  Member data removed successfully., data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */
const removeMemberById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find ec data by member id
  await notExistData(
    Ec,
    { "members._id": req.params.id },
    "Couldn't find any member data."
  );

  // remove options
  const options = {
    $pull: {
      members: {
        _id: req.params.id,
      },
    },
  };

  // find and update by member id
  const data = await Ec.findOneAndUpdate(
    { "members._id": req.params.id },
    options,
    {
      new: true,
      runValidators: true,
    }
  ).populate("members.user");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Member data removed successfully.",
    payload: {
      data,
    },
  });
});

module.exports = {
  getAllEc,
  ECFindById,
  memberDataUpdateById,
  removeMemberById,
  addEc,
  updateEcById,
  addMemberInEc,
  deleteEcById,
};
