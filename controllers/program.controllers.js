const { unlinkSync } = require("fs");
const programModel = require("../model/program.model.js");
const createError = require("http-errors");
const { successResponse } = require("../services/responseHandler.js");
const asyncHandler = require("express-async-handler");
const checkMongoId = require("../services/checkMongoId.js");
const path = require("path");
const checkImage = require("../services/imagesCheck.js");
const filterQuery = require("../helper/filterQuery.js");

/**
 *
 * @apiDescription    Get All Programs Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/programs
 * @apiAccess         public
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 *
 * @apiSuccess        { success: true , message : Program's Data Fetched Successfully , pagination: {}, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const allProgram = asyncHandler(async (req, res) => {
  // query filter
  const { queries, filters } = filterQuery(req);

  // find programs data
  const programs = await programModel
    .find(filters)
    .sort(queries.sortBy)
    .skip(queries.skip)
    .limit(queries.limit)
    .select(queries.fields);

  // count documents
  const count = await programModel.countDocuments();

  // if no data found
  if (!programs.length)
    throw createError(404, "couldn't find any program data.");

  // page & limit query
  const page = queries.page;
  const limit = queries.limit;

  // pagination object
  const pagination = {
    totalDocuments: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
  };

  // success response with data
  return successResponse(res, {
    statusCode: 200,
    message: "Programs data fetched successfully",
    payload: {
      pagination,
      data: programs,
    },
  });
});

/**
 *
 * @apiDescription    Add new Program Data
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/program
 * @apiAccess         Admin || SuperAdmin
 *
 *
 * @apiSuccess        { success: true , message : Successfully added a new program. , data: { } }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins / superAdmin  can add a new post
 *
 */

const createProgram = asyncHandler(async (req, res) => {
  // check if all fields are available
  const { title, start_date, end_date, start_time, end_time, venue, fb_url } =
    req.body;

  // if any field is missing
  if (
    !title ||
    !start_date ||
    !end_date ||
    !start_time ||
    !end_time ||
    !venue ||
    !fb_url
  )
    createError(400, "Please provide all fields");

  // create new program data
  const result = await programModel.create({
    ...req.body,
    program_photo: req.file?.filename,
  });

  // success response with data
  successResponse(res, {
    statusCode: 200,
    message: "Successfully added a new program.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Get single Program Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/program/:id
 * @apiAccess         public
 *
 *
 * @apiSuccess        { success: true , message : Successfully added a new program. , data: { } }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const findProgramById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find data by id
  const result = await programModel.findById(req.params.id);

  // if no data found
  if (!result) throw createError(404, "Couldn't find any data!");

  // success response with data
  successResponse(res, {
    statusCode: 200,
    message: "Single program data fetched successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Delete single Program Data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/programs/:id
 * @apiAccess         Admin || SuperAdmin
 *
 *
 * @apiSuccess        { success: true , message : Program data deleted successfully. ,  data: { } }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins/superAdmin can delete the data.
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const deleteProgramById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find data by id
  const programData = await programModel.findById(req.params.id);

  // if no data found
  if (!programData) throw createError(404, "No data found");

  // delete program data
  const result = await programModel.findByIdAndDelete(req.params.id);

  // find image in folder & delete
  checkImage("programs").find(
    (image) => image === programData?.program_photo
  ) &&
    unlinkSync(
      path.resolve(`./public/images/programs/${programData?.program_photo}`)
    );

  // success response with data
  successResponse(res, {
    statusCode: 200,
    message: "Program data deleted successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update single Program Data
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/programs/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiSuccess        { success: true , message : Program data updated successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const updateProgramById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find data by id
  const programData = await programModel.findById(req.params.id);

  // if no data found
  if (!programData) throw createError(404, "Couldn't find any data!");

  // update options
  const options = {
    $set: {
      ...req.body,
      program_photo: req.file?.filename,
    },
  };

  // update program data
  const result = await programModel.findByIdAndUpdate(req.params.id, options, {
    new: true,
    runValidators: true,
  });

  // find image in folder & delete
  req.file &&
    checkImage("programs").find(
      (image) => image === programData?.program_photo
    ) &&
    unlinkSync(
      path.resolve(`./public/images/programs/${programData?.program_photo}`)
    );

  // success response with data
  successResponse(res, {
    statusCode: 200,
    message: "Program data updated successfully.",
    payload: {
      data: result,
    },
  });
});

module.exports = {
  allProgram,
  createProgram,
  findProgramById,
  deleteProgramById,
  updateProgramById,
};
