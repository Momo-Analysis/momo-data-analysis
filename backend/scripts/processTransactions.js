import {parseXMLFile} from '../utils/xmlParser.js';
import {processTransactions} from '../utils/transactionParser.js';
import transaction_types from '../database/transaction_types.js';
import {
  createAirtimeBillInsertQuery,
  createBankDepositInsertQuery,
  createIncomingInsertQuery,
  createPaymentInsertQuery,
  createReclaimedInsertQuery,
  createThirdPartyInsertQuery,
  createTransferInsertQuery,
  createUtilityBillInsertQuery,
  createWithdrawnInsertQuery
} from "../database/tableInserstionQueries.js";

async function insertTransaction(connection, transaction) {
  try {
    let queryData;

    switch (transaction.type) {
      case transaction_types.incoming:
        queryData = createIncomingInsertQuery(transaction);
        break;
      case transaction_types.reclaimed:
        queryData = createReclaimedInsertQuery(transaction);
        break;
      case transaction_types.payment:
        queryData = createPaymentInsertQuery(transaction);
        break;
      case transaction_types.bank_deposit:
        queryData = createBankDepositInsertQuery(transaction);
        break;
      case transaction_types.transfer:
        queryData = createTransferInsertQuery(transaction);
        break;
      case transaction_types.withdrawn:
        queryData = createWithdrawnInsertQuery(transaction);
        break;
      case transaction_types.airtime_bill:
        queryData = createAirtimeBillInsertQuery(transaction);
        break;
      case transaction_types.utility_bill:
        queryData = createUtilityBillInsertQuery(transaction);
        break;
      case transaction_types.third_party:
        queryData = createThirdPartyInsertQuery(transaction);
        break;
      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }

    const [result] = await connection.execute(queryData.query, queryData.values);
    console.log(`Inserted transaction ${transaction.type} with ID: ${result.insertId}`);
    return result;

  } catch (error) {
    console.error(`Database insertion failed for ${transaction.type}:`, error);
    console.error('Transaction data:', transaction);
    throw error;
  }
}

export async function storeSMSData(connection) {
  try {
    const xmlData = await parseXMLFile('data/dump.xml');
    const transactions = await processTransactions(xmlData);

    await connection.query('START TRANSACTION');

    for (const transaction of transactions) {
      await insertTransaction(connection, transaction);
    }

    await connection.query('COMMIT');
    console.log(`Processed ${transactions.length} transactions`);
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error(`Data processing failed: ${error.message}`);
  } finally {
    await connection.end();
  }
}