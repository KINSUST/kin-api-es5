const createError = require("http-errors");
const { clientURL } = require("../secret");

// whitelist is an array of url's that are allowed to access the api
const whitelist = ["http://localhost:3000", "http://localhost:5173"];

// corsOptions is an object with a function that checks if the origin is in the whitelist
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(createError(401, "Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

// export the corsOptions object
module.exports = corsOptions;
