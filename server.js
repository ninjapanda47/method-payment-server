"use strict";
require("dotenv").config();
const Hapi = require("@hapi/hapi");
const routes = require("./routes/routes");

exports.init = async () => {
    const server = Hapi.server({
        port: 2000,
        host: "localhost",
        routes: {
            cors: {
                origin: ["*"],
                credentials: true,
            },
        },
    });

    server.route(routes);
    return server;
};

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});
