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
    options: {
      payload: {
        maxBytes: 209715200,
        output: "file",
        parse: true,
        multipart: true,
      },
    },
  },
  {
    method: "POST",
    path: "/batch",
    handler: handlers.batch.processBatch,
  },
  {
    method: "PUT",
    path: "/batch/{batchId}",
    handler: handlers.batch.discardBatch,
  },
  {
    method: "GET",
    path: "/batch/list",
    handler: handlers.batch.getBatchList,
  },
  {
    method: "GET",
    path: "/report/total-amount-by-source-account/{batchId}",
    handler: handlers.report.getTotalPerSourceAccountByBatchId,
  },
  {
    method: "GET",
    path: "/report/total-amount-by-branch/{batchId}",
    handler: handlers.report.getTotalPerBranchByBatchId,
  },
  {
    method: "GET",
    path: "/report/payments/{batchId}",
    handler: handlers.report.getPaymentsByBatchId,
  },
];
