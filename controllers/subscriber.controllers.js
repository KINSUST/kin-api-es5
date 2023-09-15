const createError = require("http-errors");
const subscriberModel = require("../model/subscriber.model.js");
const filterQuery = require("../helper/filterQuery.js");
const { successResponse } = require("../services/responseHandler.js");
const asyncHandler = require("express-async-handler");
const checkMongoId = require("../services/checkMongoId.js");

/**
 *
 * @apiDescription    Get All Subscriber Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/subscriber
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

const allSubscriber = asyncHandler(async (req, res) => {
  // filter query
  const { queries, filters } = filterQuery(req);

  // get all subscriber data
  const result = await subscriberModel
    .find(filters)
    .skip(queries.skip)
    .limit(queries.limit)
    .sort(queries.sortBy);

  // if no data found
  if (result.length < 1)
    throw createError(400, "Couldn't find any subscriber data!");

  // count documents
  const count = await subscriberModel.countDocuments(filters);

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
    message: "Subscriber data fetched successfully!",
    payload: {
      pagination,
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Add Subscriber Data
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/subscriber
 * @apiAccess         public
 *
 * @apiSuccess        { success: true , message : Successfully subscribed to KIN. , data: { } }
 * @apiFailed         { success: false , error: { status, message }
 *
 */

const addSubscriber = asyncHandler(async (req, res) => {
  // email
  const { email } = req.body;

  // email validation check
  if (!email) throw createError(400, "Email is required!");

  // check subscriber
  const subscriber = await subscriberModel.exists({ email });

  // if subscriber already exists
  if (subscriber) throw createError(400, "You have already subscribe.");

  // add subscriber
  const result = await subscriberModel.create(req.body);

  // response send
  successResponse(res, {
    statusCode: 201,
    message: "Successfully subscribed to KIN.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update Subscriber Data
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/subscriber/:id
 * @apiAccess         Admin || SuperAdmin
 *
 * @apiSuccess        { success: true , message : Successfully updated subscriber data. ,  data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized, Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const updateSubscriberById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find subscriber by id
  const subscriberData = await subscriberModel.findById(req.params.id);

  // if no subscriber found
  if (!subscriberData)
    throw createError(400, "Couldn't find any subscriber data!");

  // update subscriber data
  const subscriber = await subscriberModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        ...req.body,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Successfully updated subscriber data.",
    payload: {
      data: subscriber,
    },
  });
});

/**
 *
 * @apiDescription    Delete Subscriber Data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/subscriber/:id
 * @apiAccess         Admin || SuperAdmin
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

const deleteSubscriberById = asyncHandler(async (req, res) => {
  // check mongoose id
  checkMongoId(req.params.id);

  // find subscriber by id
  const subscriber = await subscriberModel.findById(req.params.id);

  // if no subscriber found
  if (!subscriber)
    throw createError(400, "Couldn't find any subscriber data!");

  // delete subscriber data
  const result = await subscriberModel.findByIdAndDelete(req.params.id);

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Successfully deleted subscriber data.",
    payload: {
      data: result,
    },
  });
});

module.exports = {
  allSubscriber,
  addSubscriber,
  updateSubscriberById,
  deleteSubscriberById,
};
