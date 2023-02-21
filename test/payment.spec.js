"use strict";
const sinon = require("sinon");
const expect = require("chai").expect;
const { init } = require("../server");
const { Payments, Batchs } = require("../models");
const mongoose = require("mongoose");
const { connectToTestDb } = require("../test/utils/mongoHelper");
const fs = require("fs");
const FormData = require("form-data");
const GetStream = require("get-stream");

describe("Payments Handler Tests", () => {
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
    sinon.restore();
  });

  it("Converts XML into Json saves to DB and create batch", async () => {
    const path = __dirname + "/testData.xml";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(path));
    formData.append("batchId", "illenium");
    const payload = await GetStream(formData);
    const res = await server.inject({
      method: "post",
      url: "/payments/upload",
      headers: formData.getHeaders(),
      payload,
    });

    const insertedPayments = await Payments.find({});
    const newBatch = await Batchs.findOne({ batchId: "illenium" }).lean();
    expect(newBatch.uniqueSourceAccounts.length).to.equal(2);
    expect(insertedPayments[0].Employee.DunkinId).to.equal(
      "EMP-a7f138d9-1885-43db-b5c7-6b7c09020b4f"
    );
    expect(insertedPayments[1].Employee.DunkinId).to.equal(
      "EMP-a2c0b94b-8152-497f-81b2-154de316b5fe"
    );
    expect(res.statusCode).to.equal(200);
    expect(res.result.success).to.equal(true);
    expect(res.result.savedPayments).to.equal(2);
    expect(res.result.sourceAccounts).to.equal(2);
    expect(res.result.batch).to.deep.equal(newBatch);
  });
});
