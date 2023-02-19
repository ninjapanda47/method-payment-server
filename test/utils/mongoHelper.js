const mongoose = require("mongoose");

const connectToTestDb = async () => {
  mongoose
    .connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true })
    .then(() => console.log("Connection to Test DB is made!"))
    .catch((err) => console.error(err));
};

exports.connectToTestDb = connectToTestDb;
