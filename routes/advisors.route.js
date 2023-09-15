const express = require("express");
const {
  allAdvisor,
  createAdvisor,
  deleteAdvisorById,
  findAdvisorById,
  updateAdvisorById,
} = require("../controllers/advisor.controllers.js");
const { advisorMulter } = require("../utils/multer.js");
const { isLoggedIn } = require("../middlewares/verify.js");
const { authorization } = require("../middlewares/authorization.js");

const advisorRouter = express.Router();

advisorRouter
  .route("/")
  .get(allAdvisor)
  .post(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    advisorMulter,
    createAdvisor
  );

advisorRouter
  .route("/:id")
  .get(findAdvisorById)
  .patch(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    advisorMulter,
    updateAdvisorById
  )
  .delete(isLoggedIn, authorization("admin", "superAdmin"), deleteAdvisorById);

// export
module.exports = advisorRouter;
