const express = require("express");
const {
  allProgram,
  createProgram,
  deleteProgramById,
  findProgramById,
  updateProgramById,
} = require("../controllers/program.controllers.js");
const { programMulter } = require("../utils/multer.js");
const { authorization } = require("../middlewares/authorization.js");
const { isLoggedIn } = require("../middlewares/verify.js");

const programRouter = express.Router();

programRouter
  .route("/")
  .get(allProgram)
  .post(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    programMulter,
    createProgram
  );

programRouter
  .route("/:id")
  .get(findProgramById)
  .patch(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    programMulter,
    updateProgramById
  )
  .delete(isLoggedIn, authorization("admin", "superAdmin"), deleteProgramById);

// export
module.exports = programRouter;
