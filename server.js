"use strict";
require("dotenv").config();
const Hapi = require("@hapi/hapi");
const routes = require("./routes/routes");
const { Method, Environments } = require("method-node");

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
  const method = new Method({
    apiKey: process.env.API_KEY,
    env: Environments.dev,
  });

  const response = await method.ping();
  console.log(response);
  server.route(routes);
  return server;
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
