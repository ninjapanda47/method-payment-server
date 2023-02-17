const { Payment } = require("../models");
const { paymentSchema } = require("../schemas");
const boom = require("boom");
const Joi = require("joi");

const insertPayments = async (req, h) => {
  const payments = req.payload.payments;
  const validatedPayments = [];
  payments.forEach((payment) => {
    const { error } = Joi.object(paymentSchema).validate(payment);
    if (!error) {
      payment.batchId = req.payload.batchId;
      validatedPayments.push(payment);
    }
  });
  // req.payload.payments  [ {payments} ]
  try {
    await Payment.insertMany(validatedPayments);
    return { success: true };
  } catch (error) {
    console.log(error);
    throw boom.badRequest(error);
  }
};
