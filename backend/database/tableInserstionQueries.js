import {formatMySQLDateTime} from "../utils/dateFormatter.js";

export function createIncomingInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, sender=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO incoming (transactionId, type, amount, timestamp, currency, sender, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, sender, originalSMS]
  };
}

export function createReclaimedInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, sender=null, senderNumber=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO reclaimed (transactionId, type, amount, timestamp, currency, sender, senderNumber, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, sender, senderNumber, originalSMS]
  };
}

export function createPaymentInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, recipient=null, recipientNumber=null, fee=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO payment (transactionId, type, amount, timestamp, currency, recipient, recipientNumber, fee, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, recipient, recipientNumber, fee, originalSMS]
  };
}

export function createBankDepositInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO bank_deposit (transactionId, type, amount, timestamp, currency, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, originalSMS]
  };
}

export function createTransferInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, recipient=null, recipientNumber=null, fee=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO transfer (transactionId, type, amount, timestamp, currency, recipient, recipientNumber, fee, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, recipient, recipientNumber, fee, originalSMS]
  };
}

export function createWithdrawnInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, agent=null, agentNumber=null, fee=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO withdrawn (transactionId, type, amount, timestamp, currency, agent, agentNumber, fee, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, agent, agentNumber, fee, originalSMS]
  };
}

export function createAirtimeBillInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, purchasedItem=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO airtime_bill (transactionId, type, amount, timestamp, currency, purchasedItem, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, purchasedItem, originalSMS]
  };
}

export function createUtilityBillInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, purchasedUtility=null, meterToken=null, fee=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO utility_bill (transactionId, type, amount, timestamp, currency, purchasedUtility, meterToken, fee, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, purchasedUtility, meterToken, fee, originalSMS]
  };
}

export function createThirdPartyInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, thirdParty=null, fee=null, externalTransactionId=null, originalSMS=null}} = data;
  return {
    query: `INSERT INTO third_party (transactionId, type, amount, timestamp, currency, thirdParty, fee, externalTransactionId, originalSMS)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, thirdParty, fee, externalTransactionId, originalSMS]
  };
}