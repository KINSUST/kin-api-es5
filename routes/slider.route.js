const express = require("express");
const sliderRouter = express.Router();

const {
  getAllSlider,
  addSlider,
  singleSlider,
  deleteSlider,
  updateSlider,
} = require("../controllers/slider.controllers");
const { authorization } = require("../middlewares/authorization");
const { isLoggedIn } = require("../middlewares/verify");
const { sliderMulter } = require("../utils/multer.js");


// routes
sliderRouter
  .route("/")
  .get(getAllSlider)
  .post(isLoggedIn, authorization("admin", "superAdmin"),sliderMulter, addSlider);

sliderRouter
  .route("/:id")
  .get(isLoggedIn, singleSlider)
  .delete(isLoggedIn, authorization("admin", "superAdmin"), deleteSlider)
  .patch(isLoggedIn, authorization("admin", "superAdmin"), sliderMulter,updateSlider);

//export router
module.exports = sliderRouter;
