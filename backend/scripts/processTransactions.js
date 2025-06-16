import {parseXMLFile} from '../utils/xmlParser.js';
import {processTransactions} from '../utils/transactionParser.js';
import transactionTypes from '../utils/transaction_types.js';
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
      case transactionTypes.incoming:
        queryData = createIncomingInsertQuery(transaction);
        break;
      case transactionTypes.reclaimed:
        queryData = createReclaimedInsertQuery(transaction);
        break;
      case transactionTypes.payment:
        queryData = createPaymentInsertQuery(transaction);
        break;
      case transactionTypes.bank_deposit:
        queryData = createBankDepositInsertQuery(transaction);
        break;
      case transactionTypes.transfer:
        queryData = createTransferInsertQuery(transaction);
        break;
      case transactionTypes.withdrawn:
        queryData = createWithdrawnInsertQuery(transaction);
        break;
      case transactionTypes.airtime_bill:
        queryData = createAirtimeBillInsertQuery(transaction);
        break;
      case transactionTypes.utility_bill:
        queryData = createUtilityBillInsertQuery(transaction);
        break;
      case transactionTypes.third_party:
        queryData = createThirdPartyInsertQuery(transaction);
        break;
      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }

    // First insert the parent transaction
    const [parentResult] = await connection.execute(queryData.parentQuery.query, queryData.parentQuery.values);
    const parentId = parentResult.insertId;

    // Then insert the child record with the actual parent ID
    const childValues = [parentId, ...queryData.values];
    const childQuery = queryData.query.replace('LAST_INSERT_ID()', '?');

    const [childResult] = await connection.execute(childQuery, childValues);

    console.log(`Inserted transaction ${transaction.type} with parent ID: ${parentId}, child ID: ${childResult.insertId}`);
    return { parentId, childId: childResult.insertId };

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