const createError = require("http-errors");
const { unlinkSync } = require("fs");
const path = require("path");
const filterQuery = require("../helper/filterQuery.js");
const asyncHandler = require("express-async-handler");
const { successResponse } = require("../services/responseHandler.js");
const checkMongoId = require("../services/checkMongoId.js");
const checkImage = require("../services/imagesCheck.js");
const advisorModel = require("../model/advisor.model.js");
const { log } = require("console");

/**
 *
 * @apiDescription    Get All Advisors Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/advisors
 * @apiAccess         public
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 * @apiParams         [ search = string ]   search by name, email, mobile
 *
 * @apiSuccess        { success: true , message : Advisors data fetched successfully. , pagination: {}, data: [] }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const allAdvisor = asyncHandler(async (req, res) => {
  // filter query
  const { queries, filters } = filterQuery(req);

  // find all advisor data
  const advisors = await advisorModel
    .find(filters)
    .skip(queries.skip)
    .limit(queries.limit)
    .sort({ index: 1 });

  // if advisor data not found
  if (advisors.length < 1) throw createError(400, "Couldn't find any data.");

  // page , total count
  const count = await advisorModel.countDocuments(filters);

  // page & limit
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

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Advisors data fetched successfully.",
    payload: {
      pagination,
      data: advisors,
    },
  });
});

/**
 *
 * @apiDescription    Create New Advisor Data
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/advisors
 * @apiAccess         admin / superAdmin
 *
 * @apiSuccess        { success: true , message : Advisor data created successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins/super-admin can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */
const createAdvisor = asyncHandler(async (req, res) => {
  // advisor check is already register or not
  const existAdvisor = await advisorModel.exists({
    email: req.body.email,
  });

  // advisor email check
  if (existAdvisor) throw createError(404, "Email already exits!");

  // create advisor data
  const user = await advisorModel.create({
    ...req.body,
    advisor_photo: req?.file?.filename,
  });

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Advisor data created successfully.",
    payload: {
      data: user,
    },
  });
});

/**
 *
 * @apiDescription    Get Single Advisor Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/advisors/:id
 * @apiAccess         public
 *
 * @apiSuccess        { success: true , message : Advisor data fetched successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const findAdvisorById = asyncHandler(async (req, res, next) => {
  //  check mongoose object id
  checkMongoId(req.params.id);

  // find advisor by id
  const advisor = await advisorModel.findById(req.params.id);


  // if advisor data not found
  if (!advisor) throw createError(400, "Couldn't find any advisor data.");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Advisor data fetched successfully.",
    payload: {
      data: advisor,
    },
  });
});

/**
 *
 * @apiDescription    Delete Single Advisor Data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/advisor/:id
 * @apiAccess         admin / superAdmin
 *
 * @apiSuccess        { success: true , message : Advisor data deleted successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const deleteAdvisorById = asyncHandler(async (req, res, next) => {
  // check mongoose object id
  checkMongoId(req.params.id);

  // find advisor by id
  const advisor = await advisorModel.findById(req.params.id);

  // if advisor data not found
  if (!advisor) throw createError(400, "Couldn't find any advisor data.");

  // data  delete from database
  const result = await advisorModel.findByIdAndDelete(req.params.id);

  // find image in folder & delete
  checkImage("advisors").find((image) => image === advisor?.advisor_photo) &&
    unlinkSync(
      path.resolve(`./public/images/advisors/${advisor?.advisor_photo}`)
    );

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Advisor data deleted successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update Single Advisor Data
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/advisors/:id
 * @apiAccess         admin / superAdmin
 *
 * @apiSuccess        { success: true , message : Advisor data updated successfully. , data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const updateAdvisorById = asyncHandler(async (req, res) => {
  // check mongoose object id
  checkMongoId(req.params.id);

  // find advisor by id
  const advisorData = await advisorModel.findById(req.params.id);

  // if advisor data not found
  if (!advisorData) throw createError(400, "Couldn't find any advisor data.");

  // update advisor data
  const advisor = await advisorModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        ...req.body,
        advisor_photo: req?.file?.filename,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // find image in folder & delete
  checkImage("advisors").find(
    (image) => image === advisorData?.advisor_photo
  ) &&
    unlinkSync(
      path.resolve(`./public/images/advisors/${advisorData?.advisor_photo}`)
    );

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Advisor data updated successfully.",
    payload: {
      data: advisor,
    },
  });
});

module.exports = {
  allAdvisor,
  createAdvisor,
  findAdvisorById,
  deleteAdvisorById,
  updateAdvisorById,
};
