const Joi = require("joi");
const handlers = require("../handlers");
const { array, string } = require("joi");

module.exports = [
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "This is backend server for Method Payment Assessment!";
    },
  },
  {
    method: "POST",
    path: "/payments/upload",
    handler: handlers.payments.insertPayments,
  },
  {
    method: "POST",
    path: "/batch",
    handler: handlers.batch.processBatch,
  },
  {
    method: "GET",
    path: "/report/total-account-by-source-account/{batchId}",
    handler: handlers.report.getTotalPerSourceAccountByBatchId,
  },
  {
    method: "GET",
    path: "/report/total-account-by-branch/{batchId}",
    handler: handlers.report.getTotalPerBranchByBatchId,
  },
  {
    method: "GET",
    path: "/report/payments/{batchId}",
    handler: handlers.report.getPaymentsByBatchId,
  },
];
