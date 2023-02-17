const mongoose = require("mongoose");
const { Schema } = mongoose;

const BatchSchema = new Schema(
  {
    batchId: String,
    status: String, // pending, processed, cancelled
  },
  { timestamps: true }
);

BatchSchema.index({ payments: 1 });

module.exports = mongoose.model("Batch", BatchSchema);
