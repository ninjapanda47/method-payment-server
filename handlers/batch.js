const { Batch } = require("../models");
const boom = require("boom");

const createBatch = async (req, h) => {
  // req.payload.batchId  :dunkindonuts-date
  let batch = new Batch({
    batchId: req.payload.batchId,
  });
  try {
    const newBatch = await batch.save();
    return { success: true, newBatch };
  } catch (error) {
    console.log(error);
    throw boom.badRequest(error);
  }
};
