"use strict";
const sinon = require("sinon");
const expect = require("chai").expect;
const { init } = require("../server");
const { Payments, Batchs } = require("../models");
const mongoose = require("mongoose");
const { connectToTestDb } = require("../test/utils/mongoHelper");

describe("Batch Handler Tests", () => {
  let server;
  before(async () => {
    server = await init();
    await connectToTestDb();
  });

  beforeEach(async () => {
    await Payments.deleteMany({});
    await Batchs.deleteMany({});
    sinon.restore();
  });

  after(async () => {
    await Payments.deleteMany({});
    await Batchs.deleteMany({});
    await server.stop();
    await mongoose.disconnect();
    sinon.restore();
  });

  it("Process batch", async () => {
    const path = __dirname + "/testData.xml";
    const res1 = await server.inject({
      method: "post",
      url: "/payments/upload",
      payload: { file: path, batchId: "ArminVanBuuren" },
    });
    expect(res1.statusCode).to.equal(200);
    const res2 = await server.inject({
      method: "post",
      url: "/batch",
      payload: { batch: res1.result.batch },
    });
    const UpdatedPayments = await Payments.find({ batchId: "ArminVanBuuren" });
    expect(UpdatedPayments[0].status).to.equal("uploaded");
    expect(UpdatedPayments[1].status).to.equal("pending");
    expect(res2.statusCode).to.equal(200);
    expect(res2.result.success).to.equal(true);
    expect(res2.result.paymentProcessedCount).to.equal(1);
  });
});
