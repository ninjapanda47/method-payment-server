const mongoose = require("mongoose");
const { Schema } = mongoose;
const Double = require("@mongoosejs/double");

const PaymentSchema = new Schema(
  {
    Employee: {
      DunkinId: String,
      DunkinBranch: String,
      FirstName: String,
      LastName: String,
      DOB: String,
      PhoneNumber: String,
    },
    Payor: {
      DunkinId: String,
      ABARouting: String,
      AccountNumber: String,
      Name: String,
      DBA: String,
      EIN: String,
      Address: {
        Line1: String,
        City: String,
        State: String,
        Zip: String,
      },
    },
    Payee: {
      PlaidId: String,
      LoanAccountNumber: String,
    },
    Amount: Double,
    Status: String,
    BatchId: String,
  },
  { timestamps: true }
);

PaymentSchema.index({
  batchId: 1,
  "Employee.DunkinId": 1,
  "Employee.DunkinBranch": 1,
  "Payor.DunkinId": 1,
});

module.exports = mongoose.model("Payment", PaymentSchema);
