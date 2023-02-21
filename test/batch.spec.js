"use strict";
const sinon = require("sinon");
const expect = require("chai").expect;
const { init } = require("../server");
const { Payments, Batchs } = require("../models");
const mongoose = require("mongoose");
const { connectToTestDb } = require("../test/utils/mongoHelper");
const FormData = require("form-data");
const fs = require("fs");
const GetStream = require("get-stream");
const { mockPayments } = require("./utils/reportTestData");

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
    sinon.restore();
  });

  it("Process batch", async () => {
    const path = __dirname + "/testData.xml";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(path));
    formData.append("batchId", "ArminVanBuuren");
    const payload = await GetStream(formData);
    const res1 = await server.inject({
      method: "post",
      url: "/payments/upload",
      headers: formData.getHeaders(),
      payload,
    });
    expect(res1.statusCode).to.equal(200);
    const res2 = await server.inject({
      method: "post",
      url: "/batch",
      payload: { batch: res1.result.batch },
    });
    const updatedPayments = await Payments.find({ batchId: "ArminVanBuuren" });
    const successfulPayment = updatedPayments.find(
      (payment) =>
        payment.Employee.DunkinId === "EMP-a2c0b94b-8152-497f-81b2-154de316b5fe"
    );
    const unsuccessfulPayment = updatedPayments.find(
      (payment) =>
        payment.Employee.DunkinId === "EMP-a7f138d9-1885-43db-b5c7-6b7c09020b4f"
    );
    expect(successfulPayment.status).to.equal("pending");
    expect(unsuccessfulPayment.status).to.equal("uploaded");
    expect(res2.statusCode).to.equal(200);
    expect(res2.result.success).to.equal(true);
    expect(res2.result.paymentProcessedCount).to.equal(1);
  });

  it("Discard batch", async () => {
    await Payments.insertMany(mockPayments);

    await Batchs.create({
      batchId: "EDCLV2023",
      uniqueSourceAccounts: [
        {
          DunkinId: "AStateOfTrance",
          ABARouting: "148386123",
          AccountNumber: "12719660",
          Name: "Insomniac, LLC",
          DBA: "EDC",
          EIN: "EDC",
          Address: {
            Line1: "7000 N. Las Vegas Blvd",
            City: "Las Vegas",
            State: "NV",
            Zip: "89115",
          },
        },
        {
          DunkinId: "BigRoomNeverDies",
          ABARouting: "148386123",
          AccountNumber: "12719660",
          Name: "Insomniac, LLC",
          DBA: "EDC",
          EIN: "EDC",
          Address: {
            Line1: "7000 N. Las Vegas Blvd",
            City: "Las Vegas",
            State: "NV",
            Zip: "89115",
          },
        },
      ],
      status: "pending",
    });
    const response = await server.inject({
      method: "put",
      url: "/batch/EDCLV2023",
    });
    expect(response.result.deletedCount).to.equal(5);
    const payments = await Payments.find({ batchId: "EDCLV2023" });
    expect(payments.length).to.equal(0);
    const updatedBatch = await Batchs.findOne({ batchId: "EDCLV2023" });
    expect(updatedBatch.status).to.equal("cancelled");
  });
  it("Get batch list", async () => {
    await Batchs.create({
      batchId: "EDCLV2023",
      uniqueSourceAccounts: [
        {
          DunkinId: "AStateOfTrance",
          ABARouting: "148386123",
          AccountNumber: "12719660",
          Name: "Insomniac, LLC",
          DBA: "EDC",
          EIN: "EDC",
          Address: {
            Line1: "7000 N. Las Vegas Blvd",
            City: "Las Vegas",
            State: "NV",
            Zip: "89115",
          },
        },
        {
          DunkinId: "BigRoomNeverDies",
          ABARouting: "148386123",
          AccountNumber: "12719660",
          Name: "Insomniac, LLC",
          DBA: "EDC",
          EIN: "EDC",
          Address: {
            Line1: "7000 N. Las Vegas Blvd",
            City: "Las Vegas",
            State: "NV",
            Zip: "89115",
          },
        },
      ],
      status: "processed",
    });
    const response = await server.inject({
      method: "get",
      url: "/batch/list",
    });
    expect(response.result.batchList.length).to.equal(1);
  });
});
