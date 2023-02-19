const { Batchs, Payments } = require("../models");
const boom = require("boom");
const { Method, Environments } = require("method-node");

const method = new Method({
  apiKey: process.env.API_KEY,
  env: Environments.dev,
});

const processBatch = async (req, h) => {
  let count = 0;
  let errorCount = 0;
  // get all entities and account to check for existing
  const entities = await method.entities.list();
  const accounts = await method.accounts.list();
  const batch = req.payload.batch;
  // Check and create entity and account for each source account
  for (const acct of batch.uniqueSourceAccounts) {
    let entity;
    entity = entities.find(
      (entity) => entity.metadata?.DunkinId === acct.DunkinId
    );
    if (!entity) {
      try {
        entity = await method.entities.create({
          type: "c_corporation",
          corporation: {
            name: acct.Name,
            dba: acct.DBA,
            ein: acct.EIN,
            owners: [],
          },
          address: {
            line1: acct.Address.Line1,
            line2: null,
            city: acct.Address.City,
            state: acct.Address.State,
            zip: acct.Address.Zip,
          },
          metadata: { DunkinId: acct.DunkinId },
        });
        entities.push(entity);
      } catch (error) {
        errorCount++;
        console.log("Error", error);
        continue;
      }
    }
    // check and create source account
    // find source account by holderId(entity.id) and account number
    let sourceAccount;
    sourceAccount = accounts.find(
      (account) =>
        account.holder_id === entity.id &&
        account.ach.number === acct.AccountNumber
    );
    // create an source account if it doesn't already exists
    if (!sourceAccount) {
      try {
        sourceAccount = await method.accounts.create({
          holder_id: entity.id,
          ach: {
            routing: acct.ABARouting,
            number: acct.AccountNumber,
            type: "checking",
          },
        });
        accounts.push(sourceAccount);
      } catch (error) {
        errorCount++;
        console.log("Error", error);
        continue;
      }
    }
    // get all payments with DunkinId
    const payments = await Payments.find({ "Payor.DunkinId": acct.DunkinId });
    // Loop through payments, create entity and destination account
    for (const payment of payments) {
      let individualEntity;
      let destinationAccount;
      let merchant;
      // Check and create individual entity
      individualEntity = entities.find(
        (entity) => entity?.metadata?.DunkinId === payment.Employee.DunkinId
      );

      if (!individualEntity) {
        try {
          individualEntity = await method.entities.create({
            type: "individual",
            individual: {
              first_name: payment.Employee.FirstName,
              last_name: payment.Employee.LastName,
              phone: "15121231111",
            },
          });
          entities.push(individualEntity);
        } catch (error) {
          console.log(error);
          continue;
        }
      }

      // check destination account and create
      // find the mch_id via plaidId
      const merchants = await method.merchants.list({
        "provider_id.plaid": payment.Payee.PlaidId,
      });
      merchant = merchants[0];
      destinationAccount = accounts.find(
        (account) =>
          account.holder_id === individualEntity.id &&
          account.liability.mch_id === merchant.mch_id &&
          payment.Payee.LoanAccountNumber.includes(account.liability.mask)
      );

      if (!destinationAccount) {
        try {
          destinationAccount = await method.accounts.create({
            holder_id: individualEntity.id,
            liability: {
              mch_id: merchant.mch_id,
              number: payment.Payee.LoanAccountNumber,
            },
          });
          accounts.push(destinationAccount);
        } catch (error) {
          console.log(error);
          continue;
        }
      }

      try {
        // make payment request
        const processPayment = await method.payments.create({
          amount: payment.Amount,
          source: sourceAccount.id,
          destination: destinationAccount.id,
          description: "Loan Pmt",
        });

        // update payment status in db
        await Payments.updateOne(
          { _id: payment._id },
          {
            status: processPayment.status,
            methodPaymentId: processPayment.id,
          }
        );
        count++;
      } catch (error) {
        console.log(error);
      }
    }
  }
  return {
    success: true,
    paymentProcessedCount: count,
  };
};

exports.processBatch = processBatch;
