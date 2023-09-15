const express = require("express");
const {
  allPost,
  createPost,
  updatePostById,
  deletePostBySlug,
  findPostBySlug,
} = require("../controllers/post.controllers.js");
const { postMulter } = require("../utils/multer.js");
const { authorization } = require("../middlewares/authorization.js");
const { isLoggedIn } = require("../middlewares/verify.js");

const postRouter = express.Router();

postRouter
  .route("/")
  .get(allPost)
  .post(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    postMulter,
    createPost
  );

postRouter
  .route("/:id")
  .patch(isLoggedIn, authorization("admin", "superAdmin"), updatePostById);
postRouter
  .route("/:slug")
  .get(isLoggedIn, authorization("admin", "superAdmin"), findPostBySlug)
  .delete(isLoggedIn, authorization("admin", "superAdmin"), deletePostBySlug);

module.exports = postRouter;
