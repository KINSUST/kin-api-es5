const express = require("express");
const {
  addSubscriber,
  allSubscriber,
  deleteSubscriberById,
  updateSubscriberById,
} = require("../controllers/subscriber.controllers.js");
const { isLoggedIn } = require("../middlewares/verify.js");
const { authorization } = require("../middlewares/authorization.js");

const subscriberRouter = express.Router();

subscriberRouter
  .route("/")
  .get(isLoggedIn, authorization("admin", "superAdmin"), allSubscriber)
  .post(addSubscriber);

subscriberRouter
  .route("/:id")
  .patch(isLoggedIn, authorization("admin", "superAdmin"), updateSubscriberById)
  .delete(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    deleteSubscriberById
  );

// export
module.exports = subscriberRouter;
