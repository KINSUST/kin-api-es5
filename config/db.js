const mongoose = require("mongoose");
const { mongoURL } = require("../secret.js");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(mongoURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(
      `MongoDB Connected: ${connect.connection.name}`.cyan.underline.bold
    );

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
      // process.exit(-1);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    // process.exit(1);
  }
};

// export
module.exports = connectDB;
