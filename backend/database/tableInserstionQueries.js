import {formatMySQLDateTime} from "../utils/dateFormatter.js";

export function createIncomingInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, sender=null}} = data;
  return {
    query: `INSERT INTO incoming (transactionId, type, amount, timestamp, currency, sender)
            VALUES (?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, sender]
  };
}

export function createReclaimedInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, sender=null, senderNumber=null}} = data;
  return {
    query: `INSERT INTO reclaimed (transactionId, type, amount, timestamp, currency, sender, senderNumber)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, sender, senderNumber]
  };
}

export function createPaymentInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, recipient=null, recipientNumber=null, fee=null}} = data;
  return {
    query: `INSERT INTO payment (transactionId, type, amount, timestamp, currency, recipient, recipientNumber, fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, recipient, recipientNumber, fee]
  };
}

export function createBankDepositInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null}} = data;
  return {
    query: `INSERT INTO bank_deposit (transactionId, type, amount, timestamp, currency)
            VALUES (?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency]
  };
}

export function createTransferInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, recipient=null, recipientNumber=null, fee=null}} = data;
  // details: {currency: 'RWF', recipient: 'Linda Green', recipientNumber: '250795963036'}
  return {
    query: `INSERT INTO transfer (transactionId, type, amount, timestamp, currency, recipient, recipientNumber, fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, recipient, recipientNumber, fee]
  };
}

export function createWithdrawnInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, agent=null, agentNumber=null, fee=null}} = data;
  return {
    query: `INSERT INTO withdrawn (transactionId, type, amount, timestamp, currency, agent, agentNumber, fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, agent, agentNumber, fee]
  };
}

export function createAirtimeBillInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, purchasedItem=null}} = data;
  return {
    query: `INSERT INTO airtime_bill (transactionId, type, amount, timestamp, currency, purchasedItem)
            VALUES (?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, purchasedItem]
  };
}

export function createUtilityBillInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, purchasedUtility=null, meterToken=null, fee=null}} = data;
  return {
    query: `INSERT INTO utility_bill (transactionId, type, amount, timestamp, currency, purchasedUtility, meterToken,
                                      fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, purchasedUtility, meterToken, fee]
  };
}

export function createThirdPartyInsertQuery(data) {
  const {transactionId, type, amount, timestamp, details: {currency=null, thirdParty=null, fee=null, externalTransactionId=null}} = data;
  return {
    query: `INSERT INTO third_party (transactionId, type, amount, timestamp, currency, thirdParty, fee,
                                     externalTransactionId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values: [transactionId, type, amount, formatMySQLDateTime(timestamp), currency, thirdParty, fee, externalTransactionId]
  };
}