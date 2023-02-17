"use strict";
require("dotenv").config();
const { init } = require("./server");
const mongoose = require("mongoose");

async function start() {
    try {
        const server = await init();
        await server.start();
        console.log("Server running at:", server.info.uri);
        mongoose
            .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
            .then(() => console.log("MongoDB is connected"))
            .catch((err) => console.error(err));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

start();
