const { unlinkSync } = require("fs");
const path = require("path");
const createError = require("http-errors");
const asyncHandler = require("express-async-handler");
const { successResponse } = require("../services/responseHandler");
const { isValidObjectId } = require("mongoose");
const sliderModel = require("../model/slider.model");
const checkImage = require("../services/imagesCheck");

/**
 * @description get all sliders data
 * @method GET
 * @route  /api/v1/slider
 * @access public
 */

const getAllSlider = asyncHandler(async (req, res) => {
  const result = await sliderModel.find().sort({ index: 1 });

  if (result.length < 1) {
    throw createError(200, "No slider data has founded");
  }

  successResponse(res, {
    statusCode: 200,
    message: "All slider data",
    payload: {
      data: result,
    },
  });
});

/**
 * @description get single slider data
 * @method GET
 * @route  /api/v1/slider/:id
 * @access private
 */

const singleSlider = asyncHandler(async (req, res) => {
  // user id validation check
  if (!isValidObjectId(req.params.id)) {
    throw customError(400, "Invalid sliderID");
  }
  const result = await sliderModel.findById(req.params.id);
  if (!result) {
    throw customError(400, "No slider data has found");
  }
  //response
  successResponse(res, {
    statusCode: 200,
    message: "Single slider data",
    payload: {
      data: result,
    },
  });
});

/**
 * @description add slider data
 * @method POST
 * @route  /api/v1/slider
 * @access private
 */

const addSlider = asyncHandler(async (req, res) => {
  const { title, link } = req.body;

  if (!title || !link) {
    throw createError(400, "Please provide all fields");
  }

  const result = await sliderModel.create({
    ...req.body,
    slider_photo: req?.file?.filename,
  });

  //response
  successResponse(res, {
    statusCode: 201,
    message: "Successfully added a new slider.",
    payload: {
      data: result,
    },
  });
});

/**
 * @description delete single slider data
 * @method DELETE
 * @route  /api/v1/slider
 * @access private
 */

const deleteSlider = asyncHandler(async (req, res) => {
  const singleSlider = req.params.id;

  // slider id validation check
  if (!isValidObjectId(req.params.id)) {
    throw createError(400, "Invalid sliderID");
  }
  const sliderData = await sliderModel.findById(singleSlider);
  // slider check
  if (!sliderData) {
    throw customError(400, "No slider has founded");
  }

  // find image in folder & delete
  checkImage("sliders").find((image) => image === sliderData?.slider_photo) &&
    unlinkSync(
      path.join(
        __dirname,
        `../public/images/sliders/${sliderData?.slider_photo}`
      )
    );

  const result = await sliderModel.findByIdAndDelete(singleSlider);

  //response
  successResponse(res, {
    statusCode: 200,
    message: "Successfully deleted a slider.",
    payload: {
      data: result,
    },
  });
});
/**
 * @description update single slider data
 * @method PUT/PATCH
 * @route  /api/v1/slider
 * @access private
 */

const updateSlider = asyncHandler(async (req, res) => {
  // slider id validation check
  if (!isValidObjectId(req.params.id)) {
    throw customError(400, "Invalid sliderID");
  }
  const slider = await sliderModel.findById(req.params.id);
  // slider check
  if (!slider) {
    throw customError(400, "No slider has founded");
  }

  const result = await sliderModel.findByIdAndUpdate(
    req.params.id,
    { $set: { ...req.body, slider_photo: req?.file?.filename } },
    { new: true, runValidators: true }
  );
  if (result && req.file) {
    checkImage("sliders").find((image) => image === slider?.slider_photo) &&
      unlinkSync(
        path.join(__dirname, `../public/images/sliders/${slider?.slider_photo}`)
      );
  }

  // response
  successResponse(res, {
    statusCode: 200,
    message: "Successfully updated a slider.",
    payload: {
      data: result,
    },
  });
});

// export slider
module.exports = {
  getAllSlider,
  singleSlider,
  addSlider,
  deleteSlider,
  updateSlider,
};
