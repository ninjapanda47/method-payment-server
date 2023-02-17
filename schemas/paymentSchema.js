const Joi = require("joi");
// validating each payment
module.exports = {
  Employee: Joi.object({
    DunkinId: Joi.string().required(),
    DunkinBranch: Joi.string().required(),
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    DOB: Joi.string(),
    PhoneNumber: Joi.string().required(),
  }),
  Payor: Joi.object({
    DunkinId: Joi.string().required(),
    ABARouting: Joi.string().required(),
    AccountNumber: Joi.string().required(),
    Name: Joi.string().required(),
    DBA: String,
    EIN: Joi.string().required(),
    Address: Joi.object({
      Line1: Joi.string().required(),
      Line2: Joi.string(),
      City: Joi.string().required(),
      State: Joi.string().required(),
      Zip: Joi.string().required(),
    }),
  }),
  Payee: Joi.object({
    PlaidId: Joi.string(),
    LoanAccountNumber: Joi.string(),
  }),
  Amount: Joi.string().required(),
  Status: String,
  BatchId: String,
};
