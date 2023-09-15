

const rateLimit = require("express-rate-limit");


// create a rate limiter object
const limiter = (limit)=>{
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: limit, // limit each IP to {limit} requests per windowMs
      message: "Too many requests from this IP, please try again in an hour!",
    });
}

module.exports = limiter;
