import {formatMySQLDateTime} from "../utils/dateFormatter.js";

// Helper function to create a transaction insert query
function createTransactionInsertQuery(data) {
  const {type, amount, timestamp, details: {originalSMS=null}} = data;
  return {
    query: `INSERT INTO transactions (type, amount, timestamp, originalSMS)
            VALUES (?, ?, ?, ?)`,
    values: [type, amount, formatMySQLDateTime(timestamp), originalSMS]
  };
}

export function createIncomingInsertQuery(data) {
  const {transactionId, details: {currency=null, sender=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO incoming (parent, transactionId, currency, sender)
            VALUES (LAST_INSERT_ID(), ?, ?, ?)`,
    values: [transactionId, currency, sender]
  };
}

export function createReclaimedInsertQuery(data) {
  const {transactionId, details: {currency=null, sender=null, senderNumber=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO reclaimed (parent, transactionId, currency, sender, senderNumber)
            VALUES (LAST_INSERT_ID(), ?, ?, ?, ?)`,
    values: [transactionId, currency, sender, senderNumber]
  };
}

export function createPaymentInsertQuery(data) {
  const {transactionId, details: {currency=null, recipient=null, recipientNumber=null, fee=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO payment (parent, transactionId, currency, recipient, recipientNumber, fee)
            VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)`,
    values: [transactionId, currency, recipient, recipientNumber, fee]
  };
}

export function createBankDepositInsertQuery(data) {
  const {transactionId, details: {currency=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO bank_deposit (parent, transactionId, currency)
            VALUES (LAST_INSERT_ID(), ?, ?)`,
    values: [transactionId, currency]
  };
}

export function createTransferInsertQuery(data) {
  const {transactionId, details: {currency=null, recipient=null, recipientNumber=null, fee=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO transfer (parent, transactionId, currency, recipient, recipientNumber, fee)
            VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)`,
    values: [transactionId, currency, recipient, recipientNumber, fee]
  };
}

export function createWithdrawnInsertQuery(data) {
  const {transactionId, details: {currency=null, agent=null, agentNumber=null, fee=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO withdrawn (parent, transactionId, currency, agent, agentNumber, fee)
            VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)`,
    values: [transactionId, currency, agent, agentNumber, fee]
  };
}

export function createAirtimeBillInsertQuery(data) {
  const {transactionId, details: {currency=null, purchasedItem=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO airtime_bill (parent, transactionId, currency, purchasedItem)
            VALUES (LAST_INSERT_ID(), ?, ?, ?)`,
    values: [transactionId, currency, purchasedItem]
  };
}

export function createUtilityBillInsertQuery(data) {
  const {transactionId, details: {currency=null, purchasedUtility=null, meterToken=null, fee=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO utility_bill (parent, transactionId, currency, purchasedUtility, meterToken, fee)
            VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)`,
    values: [transactionId, currency, purchasedUtility, meterToken, fee]
  };
}

export function createThirdPartyInsertQuery(data) {
  const {transactionId, details: {currency=null, thirdParty=null, fee=null, externalTransactionId=null}} = data;

  // First create the parent transaction
  const parentQuery = createTransactionInsertQuery(data);

  return {
    parentQuery,
    query: `INSERT INTO third_party (parent, transactionId, currency, thirdParty, fee, externalTransactionId)
            VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)`,
    values: [transactionId, currency, thirdParty, fee, externalTransactionId]
  };
}
