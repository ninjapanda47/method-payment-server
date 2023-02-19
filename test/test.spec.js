"use strict";
require("dotenv").config();
const sinon = require("sinon");
const assert = require("assert");
const expect = require("chai").expect;
const fs = require("fs");
const parseString = require("xml2js").parseString;
const { Method, Environments } = require("method-node");

const method = new Method({
  apiKey: process.env.API_KEY,
  env: Environments.dev,
});

describe("XML to JSON Tests", () => {
  it("Succesfully converts xml snippet to json", async () => {
    let convertedResult;
    const data = await fs.promises.readFile(__dirname + "/testData.xml");
    parseString(data, { explicitArray: false }, function (err, result) {
      convertedResult = result;
    });
    expect(convertedResult.root.row[0].Employee.DunkinId).to.equal(
      "EMP-a7f138d9-1885-43db-b5c7-6b7c09020b4f"
    );
    expect(convertedResult.root.row[1].Employee.DunkinId).to.equal(
      "EMP-a2c0b94b-8152-497f-81b2-154de316b5fe"
    );
  });

  it("Get merchant by plaidId test", async () => {
    const merchants = await method.merchants.list({
      "provider_id.plaid": "ins_116945",
    });

    expect(merchants.length).to.equal(1);
  });

  it("Converts a string into cents/number", async () => {
    const amount = "$8.11";
    const convertedAmount = parseInt(amount.replace(/[$.]/g, ""));
    expect(convertedAmount).to.equal(811);
  });
});
