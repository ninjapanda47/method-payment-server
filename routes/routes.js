const Joi = require("joi");
// const handlers = require("../handlers");
const { array, string } = require("joi");

module.exports = [
    {
        method: "GET",
        path: "/",
        handler: (request, h) => {
            return "This is backend server for Method Payment Assessment!";
        },
    }]