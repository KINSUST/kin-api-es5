const express = require("express");
const {
  ECFindById,
  addEc,
  addMemberInEc,
  deleteEcById,
  getAllEc,
  memberDataUpdateById,
  removeMemberById,
  updateEcById,
} = require("../controllers/ec.controllers.js");
const {
  AddECMemberValidator,
  ECValidator,
} = require("../middlewares/validator/file/ec.validator.js");
const { isLoggedIn } = require("../middlewares/verify.js");
const { authorization } = require("../middlewares/authorization.js");
const runValidation = require("../middlewares/validator/validation.js");

const ecRouter = express.Router();

// routes
ecRouter
  .route("/")
  .get(getAllEc)
  .post(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    ECValidator,
    runValidation,
    addEc
  );

  // member add in ec data  and update and remove
ecRouter
  .route("/add-member/:id")   // ec committee id
  .patch(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    AddECMemberValidator,
    runValidation,
    addMemberInEc
  );
ecRouter
  .route("/update-member/:id")  // member id
  .patch(
    isLoggedIn,
    authorization("admin", "superAdmin"),
    memberDataUpdateById
  );

ecRouter
  .route("/remove-member/:id") // member id
  .patch(isLoggedIn, authorization("admin", "superAdmin"), removeMemberById);


// ec data find by id and update and delete
ecRouter
  .route("/:id")
  .get(isLoggedIn, authorization("admin", "superAdmin"), ECFindById)
  .patch(isLoggedIn, authorization("admin", "superAdmin"), updateEcById)
  .delete(isLoggedIn, authorization("admin", "superAdmin"), deleteEcById);



// export
module.exports = ecRouter;
