const { Payments, Batchs } = require("../models");
const { paymentSchema } = require("../schemas");
const boom = require("boom");
const Joi = require("joi");
const fs = require("fs");
const { parseString } = require("xml2js");

const insertPayments = async (req, h) => {
  let convertedResult;
  const data = await fs.promises.readFile(req.payload.file.path);
  parseString(data, { explicitArray: false }, function (err, result) {
    convertedResult = result;
  });

  // get raw payments
  const payments = convertedResult.root.row;
  const validatedPayments = [];
  const uniqueSourceAccountIds = [];
  const uniqueSourceAccounts = [];
  payments.forEach((payment) => {
    const { error } = Joi.object(paymentSchema).validate(payment);
    if (!error) {
      if (!uniqueSourceAccountIds.includes(payment.Payor.DunkinId)) {
        uniqueSourceAccountIds.push(payment.Payor.DunkinId);
        uniqueSourceAccounts.push(payment.Payor);
      }
      payment.batchId = req.payload.batchId;
      payment.Amount = parseInt(payment.Amount.replace(/[$.]/g, ""));
      validatedPayments.push(payment);
    }
  });
  try {
    let batch = new Batchs({
      batchId: req.payload.batchId,
      uniqueSourceAccounts,
      status: "pending",
    });
    const newBatch = await batch.save();
    const savedPayments = await Payments.insertMany(validatedPayments);
    return {
      success: true,
      savedPayments: savedPayments.length,
      sourceAccounts: uniqueSourceAccounts.length,
      batch: newBatch.toObject(),
    };
  } catch (error) {
    console.log(error);
    throw boom.badRequest(error);
  }
};

exports.insertPayments = insertPayments;
