// scripts/processTransactions.js
import {parseXMLFile} from '../utils/xmlParser.js';
import {processTransactions} from '../utils/transactionParser.js';

async function insertTransaction(transaction) {
  try {
    console.log(transaction);
  } catch (error) {
    console.error(`Database insertion failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    const xmlData = await parseXMLFile('data/dump.xml');
    const transactions = await processTransactions(xmlData);

    for (const transaction of transactions) {
      await insertTransaction(transaction);
    }

    console.info(`Processed ${transactions.length} transactions`);
  } catch (error) {
    console.error(`Main process failed: ${error.message}`);
  }
}

main().then(() => {
  console.log('done');
}).catch(error => {
  console.error(error);
});