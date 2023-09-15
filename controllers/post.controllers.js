const { unlinkSync } = require("fs");
const asyncHandler = require("express-async-handler");
const filterQuery = require("../helper/filterQuery.js");
const createError = require("http-errors");
const { successResponse } = require("../services/responseHandler.js");
const postModel = require("../model/post.model.js");
const checkImage = require("../services/imagesCheck.js");
const path = require("path");
const { log } = require("console");

/**
 *
 * @apiDescription    Get all post data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/post
 * @apiAccess         public
 *
 * @apiSuccess        { success: true , message: Post data fetched successfully., data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 *
 */

const allPost = asyncHandler(async (req, res) => {
  // filter query
  const { queries, filters } = filterQuery(req);

  // create post data
  const post = await postModel
    .find(filters)
    .sort(queries.sortBy)
    .skip(queries.skip)
    .limit(queries.limit)
    .select(queries.fields);

  // if post data not found
  if (!post.length) throw createError(400, "Couldn't find any data.");

  //  count
  const count = await postModel.countDocuments(filters);

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
    message: "Post data fetched successfully.",
    payload: {
      pagination,
      data: post,
    },
  });
});

/**
 *
 * @apiDescription    Create a new post
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/post
 * @apiAccess         admin / superAdmin
 *
 * @apiSuccess        { success: true , message: Successfully added a new post., data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 * @apiError          ( Conflict: 409 )       Already have an account.
 *
 */

const createPost = asyncHandler(async (req, res) => {
  // create post data
  const post = await postModel.create({
    ...req.body,
    post_photo: req?.file?.filename,
  });

  // success response send
  successResponse(res, {
    statusCode: 201,
    message: "Successfully added a new post.",
    payload: {
      data: post,
    },
  });
});

/**
 *
 * @apiDescription    Get single post data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/post/:slug
 * @apiAccess         admin / superAdmin
 *
 * @apiParams         { slug }
 *
 * @apiSuccess        { success: true , message: Post data fetched successfully., data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 * @apiError          ( Conflict: 409 )       Already have an account.
 *
 */

const findPostBySlug = asyncHandler(async (req, res) => {
  // get slug
  const slug = req.params.slug;

  // get post data by slug
  const post = await postModel.findOne().where("slug").equals(slug);

  // if post data not found
  if (!post) throw createError(400, "Couldn't find any data.");

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Post data fetched successfully.",
    payload: {
      data: post,
    },
  });
});

/**
/**
 *
 * @apiDescription    Delete single post data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/post/:slug
 * @apiAccess         admin / superAdmin
 *
 * @apiSuccess        { success: true , message: Successfully deleted the post., data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 * @apiError          ( Conflict: 409 )       Already have an account.
 *
 */

const deletePostBySlug = asyncHandler(async (req, res) => {
  // get slug
  const slug = req.params.slug;

  // find post by slug
  const post = await postModel.findOne({ slug });

  // if no data found
  if (!post) throw createError(400, "Couldn't find any data.");

  // find image in folder & delete
  checkImage("posts").find((image) => image === post?.post_photo) &&
    unlinkSync(path.resolve(`./public/images/posts/${post?.post_photo}`));
  const result = await postModel.findOneAndDelete({ slug });

  // success response send
  successResponse(res, {
    statusCode: 200,
    message: "Successfully deleted the post.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update single post data
 * @apiMethod         PATCH
 *
 * @apiRoute          /api/v1/post/:id
 * @apiAccess         admin / superAdmin
 *
 *
 * @apiSuccess        { success: true , message: Successfully updated the post., data: {} }
 * @apiFailed         { success: false , error: { status, message }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( Not Found: 404 )      Couldn't find any data!
 * @apiError          ( Conflict: 409 )       Already have an account.
 *
 */

const updatePostById = asyncHandler(async (req, res, next) => {
  // find post by id
  const post = await postModel.findById(req.params.id);
  // if no data found

  if (!post) throw createError(400, "Couldn't find any data.");

  // find post and update
  const result = await postModel.findByIdAndUpdate(
    req.params.id,
    {
      $push: { comment: req?.body?.comment },
      $set: {
        slug: req?.body?.slug,
        title: req?.body?.title,
        post_photo: req?.file?.filename,
        date: req?.body?.date,
      },
    },
    { new: true }
  );

  // response send
  successResponse(res, {
    statusCode: 200,
    message: "Successfully updated the post.",
    payload: {
      data: result,
    },
  });
});

module.exports = {
  allPost,
  createPost,
  findPostBySlug,
  deletePostBySlug,
  updatePostById,
};
