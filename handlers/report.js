const { Payments } = require("../models");
const { stringify } = require("csv-stringify");
// Total amount of funds paid out per unique source account.
const getTotalPerSourceAccountByBatchId = async (req, h) => {
  const batchId = req.params.batchId;
  const results = await Payments.aggregate([
    { $match: { batchId } },
    {
      $group: {
        _id: "$Payor.DunkinId",
        totalAmount: { $sum: "$Amount" },
      },
    },
  ]);
  const convertedData = results.map((res) => {
    return {
      sourceAccountId: res._id,
      totalAmount: (res.totalAmount / 100).toFixed(2),
    };
  });
  const stream = stringify(convertedData, { header: true });
  return h
    .response(stream)
    .type("text/csv")
    .header("Connection", "keep-alive")
    .header("Cache-Control", "no-cache")
    .header(
      "Content-Disposition",
      `attachment;filename=TotalPerSourceAccountByBatchId${new Date().toString()}.csv`
    );
};
// Total amount of funds paid out per Dunkin branch.
const getTotalPerBranchByBatchId = async (req, h) => {
  const batchId = req.params.batchId;
  const results = await Payments.aggregate([
    { $match: { batchId } },
    {
      $group: {
        _id: "$Employee.DunkinBranch",
        totalAmount: { $sum: "$Amount" },
      },
    },
  ]);
  const convertedData = results.map((res) => {
    return {
      branchId: res._id,
      totalAmount: (res.totalAmount / 100).toFixed(2),
    };
  });
  const stream = stringify(convertedData, { header: true });
  return h
    .response(stream)
    .type("text/csv")
    .header("Connection", "keep-alive")
    .header("Cache-Control", "no-cache")
    .header(
      "Content-Disposition",
      `attachment;filename=TotalPerBranchByBatchId${new Date().toString()}.csv`
    );
};

// The status of every payment and its relevant metadata.
const getPaymentsByBatchId = async (req, h) => {
  const batchId = req.params.batchId;
  const results = await Payments.find({ batchId });
  const convertedData = results.map((res) => {
    return {
      paymentId: res.methodPaymentId,
      employeeId: res.Employee.DunkinId,
      branchId: res.Employee.DunkinBranch,
      sourceAccountId: res.Payor.DunkinId,
      amount: (res.Amount / 100).toFixed(2),
      status: res.status,
    };
  });
  const stream = stringify(convertedData, { header: true });
  return h
    .response(stream)
    .type("text/csv")
    .header("Connection", "keep-alive")
    .header("Cache-Control", "no-cache")
    .header(
      "Content-Disposition",
      `attachment;filename=PaymentsBatchId${new Date().toString()}.csv`
    );
};

exports.getTotalPerSourceAccountByBatchId = getTotalPerSourceAccountByBatchId;
exports.getTotalPerBranchByBatchId = getTotalPerBranchByBatchId;
exports.getPaymentsByBatchId = getPaymentsByBatchId;
