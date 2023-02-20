"use strict";
const sinon = require("sinon");
const expect = require("chai").expect;
const { init } = require("../server");
const { Payments, Batchs } = require("../models");
const mongoose = require("mongoose");
const { connectToTestDb } = require("../test/utils/mongoHelper");
const { mockPayments } = require("../test/utils/reportTestData");

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

  it("Get total per source account by batchId ", async () => {
    await Payments.insertMany(mockPayments);
    const response = await server.inject({
      method: "get",
      url: "/report/total-account-by-source-account/EDCLV2023",
    });
    expect(response.payload).to.include("BigRoomNeverDies,1500.00");
    expect(response.payload).to.include("AStateOfTrance,1000.00");
  });
  it("Get total per branch by batchId ", async () => {
    await Payments.insertMany(mockPayments);
    const response = await server.inject({
      method: "get",
      url: "/report/total-account-by-branch/EDCLV2023",
    });
    expect(response.payload).to.include("1,500.00");
    expect(response.payload).to.include("2,500.00");
    expect(response.payload).to.include("3,500.00");
    expect(response.payload).to.include("4,500.00");
    expect(response.payload).to.include("5,500.00");
  });
  it("Get payments by batchId ", async () => {
    await Payments.insertMany(mockPayments);
    const response = await server.inject({
      method: "get",
      url: "/report/payments/EDCLV2023",
    });
    expect(response.payload).to.include(
      "methodPaymentId1,1,1,BigRoomNeverDies,500.00,pending"
    );
    expect(response.payload).to.include(
      "methodPaymentId2,2,2,BigRoomNeverDies,500.00,pending"
    );
    expect(response.payload).to.include(
      "methodPaymentId3,3,3,AStateOfTrance,500.00,pending"
    );
    expect(response.payload).to.include(
      "methodPaymentId4,4,4,BigRoomNeverDies,500.00,pending"
    );
    expect(response.payload).to.include(
      "methodPaymentId5,5,5,AStateOfTrance,500.00,pending"
    );
  });
});
